export class CommandCompatibilityAdapter {
  constructor(documentRef, reportError = () => {}) {
    this.document = documentRef;
    this.reportError = reportError;
  }

  execute(command, value = null) {
    try {
      if (!this.document || typeof this.document.execCommand !== "function") return false;
      return this.document.execCommand(command, false, value);
    } catch (error) {
      this.reportError(`command:${command}`, error);
      return false;
    }
  }

  queryState(command) {
    try {
      if (!this.document || typeof this.document.queryCommandState !== "function") return false;
      return !!this.document.queryCommandState(command);
    } catch (error) {
      this.reportError(`command-state:${command}`, error);
      return false;
    }
  }
}
