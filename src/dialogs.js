let dialogSequence = 0;

function fieldElement(documentRef, dialogId, field) {
  const wrapper = documentRef.createElement("div");
  wrapper.className = "feather-dialog-field";
  const id = `${dialogId}_${field.name}`;
  const label = documentRef.createElement("label");
  label.htmlFor = id;
  label.textContent = field.label;
  const input = documentRef.createElement("input");
  input.id = id;
  input.name = field.name;
  input.type = field.type || "text";
  if (field.value != null) input.value = String(field.value);
  if (field.placeholder) input.placeholder = field.placeholder;
  if (field.accept) input.accept = field.accept;
  if (field.required) input.required = true;
  if (field.min != null) input.min = String(field.min);
  if (field.max != null) input.max = String(field.max);
  if (field.step != null) input.step = String(field.step);
  if (field.autocomplete) input.autocomplete = field.autocomplete;
  if (field.description) {
    const description = documentRef.createElement("small");
    description.id = `${id}_description`;
    description.textContent = field.description;
    input.setAttribute("aria-describedby", description.id);
    wrapper.append(label, input, description);
  } else {
    wrapper.append(label, input);
  }
  return { wrapper, input };
}

export class DialogManager {
  constructor(editor) {
    this.editor = editor;
    this.active = null;
  }

  open(options) {
    this.close(false);
    this.editor.findReplaceManager?.close();
    const documentRef = this.editor.element.ownerDocument;
    const focused = documentRef.activeElement;
    const previousFocus = this.editor.wrapper.contains(focused)
      ? focused
      : this.editor.activeSurface();
    const dialogId = `feather_dialog_${++dialogSequence}`;
    const overlay = documentRef.createElement("div");
    overlay.className = "feather-dialog-backdrop";

    const dialog = documentRef.createElement("section");
    dialog.className = "feather-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", `${dialogId}_title`);

    const title = documentRef.createElement("h2");
    title.id = `${dialogId}_title`;
    title.textContent = options.title;
    const form = documentRef.createElement("form");
    form.noValidate = true;
    if (options.description) {
      const description = documentRef.createElement("p");
      description.className = "feather-dialog-description";
      description.textContent = options.description;
      form.appendChild(description);
    }
    const fields = new Map();
    for (const definition of options.fields || []) {
      const { wrapper, input } = fieldElement(
        documentRef,
        dialogId,
        definition,
      );
      fields.set(definition.name, input);
      form.appendChild(wrapper);
    }

    const error = documentRef.createElement("div");
    error.className = "feather-dialog-error";
    error.setAttribute("role", "alert");
    error.hidden = true;
    form.appendChild(error);

    const actions = documentRef.createElement("div");
    actions.className = "feather-dialog-actions";
    const cancel = documentRef.createElement("button");
    cancel.type = "button";
    cancel.className = "feather-dialog-cancel";
    cancel.textContent = options.cancelLabel || this.editor.t("common.cancel");
    const confirm = documentRef.createElement("button");
    confirm.type = "submit";
    confirm.className = "feather-dialog-confirm";
    confirm.textContent = options.confirmLabel || this.editor.t("common.insert");
    actions.append(cancel, confirm);
    form.appendChild(actions);
    dialog.append(title, form);
    overlay.appendChild(dialog);
    this.editor.wrapper.appendChild(overlay);

    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    const active = {
      overlay,
      dialog,
      form,
      fields,
      error,
      cancel,
      confirm,
      previousFocus,
      resolve: resolvePromise,
      settled: false,
    };
    this.active = active;

    const finish = (result) => {
      if (active.settled) return;
      active.settled = true;
      active.overlay.remove();
      if (this.active === active) this.active = null;
      const previousFocusUsable =
        active.previousFocus?.isConnected &&
        !active.previousFocus.closest?.(".feather-hidden") &&
        !active.previousFocus.disabled;
      const focusTarget = previousFocusUsable
        ? active.previousFocus
        : this.editor.activeSurface();
      if (focusTarget && typeof focusTarget.focus === "function")
        focusTarget.focus();
      active.resolve(result);
      this.editor.emit("dialogclose", { confirmed: result !== false });
    };
    active.finish = finish;

    cancel.addEventListener("click", () => finish(false));
    overlay.addEventListener("mousedown", (event) => {
      if (event.target === overlay) finish(false);
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [
        ...dialog.querySelectorAll(
          "input:not([disabled]), button:not([disabled])",
        ),
      ];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && documentRef.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && documentRef.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      error.hidden = true;
      const values = {};
      for (const [name, input] of fields)
        values[name] =
          input.type === "file" ? input.files?.[0] || null : input.value;
      confirm.disabled = true;
      cancel.disabled = true;
      dialog.setAttribute("aria-busy", "true");
      try {
        const result = await options.onConfirm(values, { fields, dialog });
        if (result === false)
          throw new Error(
            options.invalidMessage || this.editor.t("common.invalidValues"),
          );
        finish(result ?? true);
      } catch (caught) {
        error.textContent =
          caught instanceof Error ? caught.message : String(caught);
        error.hidden = false;
        confirm.disabled = false;
        cancel.disabled = false;
        dialog.removeAttribute("aria-busy");
        const invalid =
          [...fields.values()].find((input) => !input.checkValidity?.()) ||
          [...fields.values()][0];
        invalid?.focus();
      }
    });

    this.editor.emit("dialogopen", { title: options.title, dialog });
    const initial = options.initialField
      ? fields.get(options.initialField)
      : fields.values().next().value;
    (initial || confirm).focus();
    promise.dialog = dialog;
    return promise;
  }

  close(result = false) {
    if (!this.active) return false;
    this.active.finish(result);
    return result;
  }

  destroy() {
    this.close(false);
    this.editor = null;
  }
}
