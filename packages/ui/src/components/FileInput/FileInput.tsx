import { useEffect, useId, useRef, useState } from 'react';
import type * as FilePondApi from 'filepond';
import type { FilePond, FilePondFile, FilePondOptions } from 'filepond';
import type { FieldProps } from '../Field/FieldShell';
import { cx } from '../../utils/cx';
import {
  describeAccept,
  escapeHtml,
  matchesAccept,
  parseAccept,
  parseSize,
  rejectionMessage,
  type FileRejectionReason,
} from './accept';

export interface FileInputProps extends FieldProps {
  /** Accepted types, as for the native attribute: `".pdf,.docx,text/plain"` or a list. Extensions, exact MIME types and `image/*` wildcards. */
  accept?: string | readonly string[] | undefined;
  /** How the accepted types read in the error message. Default derived from `accept` ("PDF, DOCX or plain text"). */
  acceptLabel?: string | undefined;
  /** Largest file accepted, in bytes or as `"10MB"` (base 1000, like the size shown in the list). */
  maxFileSize?: number | string | undefined;
  /** Allows several files. Without it a new file replaces the current one. */
  multiple?: boolean | undefined;
  /** With `multiple`, the most files the list holds. */
  maxFiles?: number | undefined;
  /** Controlled list of accepted files. Pass `[]` to clear. */
  files?: readonly File[] | undefined;
  /** Initial files when uncontrolled. */
  defaultFiles?: readonly File[] | undefined;
  /** Called with the accepted files (plain `File` objects) after every add or remove. Rejected files never appear here. */
  onFilesChange?: ((files: File[]) => void) | undefined;
  /** Drop zone text before the browse link. Default "Drop a file here or" (or "Drop files here or" with `multiple`). */
  idleLabel?: string | undefined;
  /** The browse link's text. Default "browse". */
  browseLabel?: string | undefined;
}

type FilePondModule = typeof FilePondApi;

const REMOVE_ICON =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';

const sameFiles = (a: readonly File[], b: readonly File[]) =>
  a.length === b.length && a.every((file, i) => file === b[i]);

/**
 * A labelled file picker with a drop zone, on FilePond (docs/adr/0004). Files stay in the browser: the
 * component hands plain `File` objects to `onFilesChange`, and with `name` it also keeps them in a file
 * input so a `<form>` (or a Server Action) submits them. Type, size and count are checked before a file
 * joins the list; a rejected file never joins it, and the reason shows in the field's error slot and is
 * announced. FilePond loads on mount, so the server renders a static drop zone and nothing of FilePond.
 */
export function FileInput({
  label,
  hideLabel = false,
  description,
  error,
  invalid = false,
  required = false,
  disabled = false,
  name,
  size = 'md',
  className,
  accept,
  acceptLabel,
  maxFileSize,
  multiple = false,
  maxFiles,
  files,
  defaultFiles,
  onFilesChange,
  idleLabel,
  browseLabel = 'browse',
}: FileInputProps) {
  const id = useId();
  const labelId = `${id}label`;
  const descriptionId = `${id}description`;
  const messagesId = `${id}messages`;

  const controlled = files !== undefined;
  const [uncontrolledFiles, setUncontrolledFiles] = useState<readonly File[]>(defaultFiles ?? []);
  const current = controlled ? files : uncontrolledFiles;

  const [rejections, setRejections] = useState<string[]>([]);
  const [inputId, setInputId] = useState<string>();
  /** Bumps every time a pond is created, so the sync effects run against the new instance. */
  const [pondVersion, setPondVersion] = useState(0);

  const hostRef = useRef<HTMLDivElement>(null);
  const pondRef = useRef<FilePond | null>(null);
  const moduleRef = useRef<FilePondModule | null>(null);
  const patchRef = useRef<() => void>(() => {});
  /** The files last handed out (or received), so FilePond's repeated events don't re-emit. */
  const settledRef = useRef<readonly File[]>(current);
  /** While the pond is being brought to the `files` prop, the list it should reach. */
  const targetRef = useRef<readonly File[] | null>(null);

  const acceptList = parseAccept(accept);
  const acceptAttr = acceptList.join(',');
  const maxBytes = parseSize(maxFileSize);
  const messages = [...rejections, ...(error != null ? [error] : [])];
  const isInvalid = invalid || messages.length > 0;
  const idleText =
    idleLabel ??
    (multiple
      ? 'Drop files here or'
      : current.length > 0
        ? 'Drop another file to replace it, or'
        : 'Drop a file here or');

  // Everything the long-lived FilePond callbacks read, refreshed on every render.
  const live = {
    acceptList,
    acceptLabel: acceptLabel ?? describeAccept(acceptList),
    maxBytes,
    maxFiles: multiple ? maxFiles : 1,
    multiple,
    current,
    controlled,
    onFilesChange,
    labelId,
    describedBy: [description != null ? descriptionId : null, messages.length > 0 ? messagesId : null],
    isInvalid,
    acceptAttr,
  };
  const liveRef = useRef(live);
  useEffect(() => {
    liveRef.current = live;
  });

  // Create the pond on mount; destroy it on unmount (and between StrictMode's double mount).
  useEffect(() => {
    let cancelled = false;
    let pond: FilePond | null = null;
    let observer: MutationObserver | null = null;
    const host = hostRef.current;
    if (!host) return undefined;

    const reject = (reason: FileRejectionReason, file?: File) => {
      const l = liveRef.current;
      const message = rejectionMessage(reason, {
        name: file?.name,
        size: file?.size,
        acceptLabel: l.acceptLabel,
        maxFileSize: l.maxBytes,
        maxFiles: l.maxFiles,
      });
      setRejections((list) => (list.includes(message) ? list : [...list, message]));
      // A file the `files` prop asked for but that fails validation: stop waiting for it.
      if (file && targetRef.current) {
        targetRef.current = targetRef.current.filter((f) => f !== file);
        queueMicrotask(emit);
      }
    };
    // A new drop or browse starts a new attempt: earlier rejections no longer apply.
    const startAttempt = () => setRejections((list) => (list.length ? [] : list));
    let removeIntent = false;
    const acceptedIds = new Set<string>();
    const noteRemove = (event: Event) => {
      if ((event.target as Element | null)?.closest?.('.filepond--action-remove-item')) removeIntent = true;
    };

    const emit = () => {
      const mod = moduleRef.current;
      if (!pond || !mod) return;
      const idle = pond
        .getFiles()
        .filter((item: FilePondFile) => item.status === mod.FileStatus.IDLE)
        .map((item: FilePondFile) => item.file as File);
      // Single mode: a new accepted file replaces the old one, which leaves a beat later.
      const accepted = liveRef.current.multiple ? idle : idle.slice(-1);
      const target = targetRef.current;
      if (target) {
        if (!sameFiles(accepted, target)) return;
        targetRef.current = null;
        settledRef.current = accepted;
        // The prop (or `defaultFiles`) asked for a file that was rejected: report what the pond holds.
        if (!sameFiles(accepted, liveRef.current.current)) {
          if (!liveRef.current.controlled) setUncontrolledFiles(accepted);
          liveRef.current.onFilesChange?.(accepted);
        }
        return;
      }
      if (sameFiles(accepted, settledRef.current)) return;
      settledRef.current = accepted;
      if (!liveRef.current.controlled) setUncontrolledFiles(accepted);
      liveRef.current.onFilesChange?.(accepted);
    };

    // Keeps FilePond's DOM wired to our label, description, errors and keyboard model.
    const patch = () => {
      if (!pond) return;
      const l = liveRef.current;
      const root = pond.element;
      if (!root) return;
      const set = (el: Element | null, attr: string, value: string | null) => {
        if (!el || el.getAttribute(attr) === value) return;
        if (value == null) el.removeAttribute(attr);
        else el.setAttribute(attr, value);
      };
      const input = root.querySelector<HTMLInputElement>('input.filepond--browser');
      const dropLabel = root.querySelector('.filepond--drop-label label');
      set(input, 'aria-labelledby', l.labelId);
      set(input, 'aria-describedby', [dropLabel?.id, ...l.describedBy].filter(Boolean).join(' ') || null);
      set(input, 'aria-invalid', l.isInvalid ? 'true' : null);
      set(input, 'accept', l.acceptAttr || null);
      // FilePond always runs in multi mode here (see `addfile`); the picker follows `multiple`.
      set(input, 'multiple', l.multiple ? '' : null);
      // One tab stop: the file input. FilePond also makes the "browse" text focusable, with no role.
      set(root.querySelector('.filepond--label-action'), 'tabindex', null);
      for (const item of root.querySelectorAll('.filepond--item')) {
        const fileName = item.querySelector('.filepond--file-info-main')?.textContent?.trim();
        if (fileName)
          set(item.querySelector('.filepond--action-remove-item'), 'aria-label', `Remove ${fileName}`);
      }
      // FilePond drops its file input while disabled; the label's `for` follows.
      setInputId(input?.id || undefined);
    };

    void import('filepond').then((mod) => {
      if (cancelled || !mod.supported()) return;
      moduleRef.current = mod;
      const options: FilePondOptions = {
        credits: false,
        allowPaste: false,
        allowReorder: false,
        allowProcess: false,
        allowRevert: false,
        instantUpload: false,
        dropOnPage: false,
        // Always multi: FilePond's own single mode replaces the current file *before* validating the new
        // one, so a rejected file would discard a good one. Replacement happens in `addfile` instead.
        allowMultiple: true,
        allowReplace: false,
        itemInsertLocation: 'after',
        fileSizeBase: 1000,
        iconRemove: REMOVE_ICON,
        labelButtonRemoveItem: 'Remove',
        styleButtonRemoveItemPosition: 'right',
        beforeAddFile: (item) => {
          const l = liveRef.current;
          const file = item.file as File;
          if (!matchesAccept(file, l.acceptList)) return (reject('type', file), false);
          if (l.maxBytes != null && file.size > l.maxBytes) return (reject('size', file), false);
          return true;
        },
      };
      // At runtime `create(options)` builds a detached root; the typings only declare `create(element, options)`.
      pond = (mod.create as unknown as (o: FilePondOptions) => FilePond)(options);
      const root = pond.element;
      if (!root) return;
      host.appendChild(root);
      pondRef.current = pond;
      patchRef.current = patch;
      pond.on('addfile', (error: unknown, added: FilePondFile) => {
        if (!error) acceptedIds.add(added.id);
        if (!error && !liveRef.current.multiple)
          for (const other of pond?.getFiles() ?? []) if (other.id !== added.id) pond?.removeFile(other.id);
        emit();
      });
      pond.on('removefile', (_error: unknown, removed: FilePondFile) => {
        // Removing with the × takes focus with it; hand it back to the field's control.
        const active = document.activeElement;
        const inRemovedRow = active?.closest('.filepond--item')?.id === `filepond--item-${removed.id}`;
        if (inRemovedRow || (removeIntent && (active == null || active === document.body)))
          root.querySelector<HTMLInputElement>('input.filepond--browser')?.focus();
        removeIntent = false;
        // An accepted file leaving (the × or the `files` prop) ends the attempt a rejection was about. A
        // rejected file never fired `addfile`, so its own removal keeps the message.
        if (acceptedIds.delete(removed.id)) startAttempt();
        emit();
      });
      pond.on('updatefiles', emit);
      pond.on('warning', (warning: { body?: string } | undefined) => {
        if (warning?.body === 'Max files') reject('count');
      });
      observer = new MutationObserver(patch);
      observer.observe(root, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['tabindex', 'aria-labelledby', 'aria-describedby', 'accept', 'id', 'multiple'],
      });
      host.addEventListener('drop', startAttempt, true);
      host.addEventListener('change', startAttempt, true);
      host.addEventListener('click', noteRemove, true);
      settledRef.current = [];
      setPondVersion((v) => v + 1);
    });

    return () => {
      cancelled = true;
      host.removeEventListener('drop', startAttempt, true);
      host.removeEventListener('change', startAttempt, true);
      host.removeEventListener('click', noteRemove, true);
      observer?.disconnect();
      if (pond) {
        pond.element?.remove();
        pond.destroy();
      }
      pondRef.current = null;
      patchRef.current = () => {};
    };
  }, []);

  // Props → FilePond options and DOM wiring.
  useEffect(() => {
    const pond = pondRef.current;
    if (!pond) return;
    pond.setOptions({
      name: name ?? '',
      storeAsFile: name != null,
      disabled,
      required,
      maxFiles: multiple ? (maxFiles ?? null) : null,
      allowRemove: !disabled,
      labelIdle: `${escapeHtml(idleText)} <span class="filepond--label-action">${escapeHtml(browseLabel)}</span>`,
    });
    // FilePond rewrites some attributes on its next frame; the MutationObserver re-patches then.
    patchRef.current();
  }, [
    pondVersion,
    name,
    disabled,
    required,
    multiple,
    maxFiles,
    idleText,
    browseLabel,
    labelId,
    acceptAttr,
    isInvalid,
    description,
    messages.length,
  ]);

  // The `files` prop (or `defaultFiles`) → the pond's list.
  useEffect(() => {
    const pond = pondRef.current;
    const mod = moduleRef.current;
    if (!pond || !mod) return;
    const items = pond.getFiles();
    const idle = items.filter((item) => item.status === mod.FileStatus.IDLE);
    const inPond = idle.map((item) => item.file as File);
    if (sameFiles(inPond, current)) {
      settledRef.current = current;
      return;
    }
    targetRef.current = current;
    for (const item of idle) if (!current.includes(item.file as File)) pond.removeFile(item.id);
    const toAdd = current.filter((file) => !inPond.includes(file));
    if (toAdd.length > 0) void pond.addFiles(toAdd);
  }, [current, pondVersion]);

  const ready = pondVersion > 0;
  return (
    <div
      className={cx('sc-field', 'sc-file-input-field', className)}
      data-size={size}
      data-disabled={disabled ? '' : undefined}
      data-invalid={isInvalid ? '' : undefined}
    >
      <label
        id={labelId}
        htmlFor={inputId}
        className={cx('sc-field__label', hideLabel && 'sc-visually-hidden')}
      >
        {label}
        {required ? (
          <span className="sc-field__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <div
        className="sc-file-input"
        data-ready={ready ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        data-invalid={isInvalid ? '' : undefined}
        data-multiple={multiple ? '' : undefined}
      >
        {ready ? null : (
          // Server render and first paint: the same drop zone, inert until FilePond takes over.
          <div className="sc-file-input__placeholder" aria-hidden="true">
            {idleText} <span className="sc-file-input__browse">{browseLabel}</span>
          </div>
        )}
        {/* FilePond's root is appended here; React never renders children into this node. */}
        <div ref={hostRef} className="sc-file-input__pond" />
      </div>
      {description != null ? (
        <p id={descriptionId} className="sc-field__description">
          {description}
        </p>
      ) : null}
      {/* Always present so a rejection that appears after a drop is announced. */}
      <div id={messagesId} className="sc-file-input__messages" aria-live="polite">
        {messages.map((message, i) => (
          <p key={i} className="sc-field__error">
            {message}
          </p>
        ))}
      </div>
    </div>
  );
}
