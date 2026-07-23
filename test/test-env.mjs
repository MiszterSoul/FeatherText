const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");

if (navigatorDescriptor && navigatorDescriptor.configurable && !navigatorDescriptor.writable) {
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    enumerable: navigatorDescriptor.enumerable ?? true,
    value: globalThis.navigator,
    writable: true,
  });
}
