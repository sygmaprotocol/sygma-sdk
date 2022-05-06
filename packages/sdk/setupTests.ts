declare global {
  interface Window {
    ethereum: any
  }
}

jest.setTimeout(20000);

export {}
