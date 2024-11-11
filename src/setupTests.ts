// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

global.URL.createObjectURL = jest.fn();

class Worker {
  url: string;
  onmessage: (m?: any) => void;
  constructor(stringUrl: string) {
    this.url = stringUrl;
    this.onmessage = () => {};
  }

  postMessage(msg: any) {
    this.onmessage(msg);
  }
}
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

(window.Worker as any) = Worker;

jest.mock("recharts", () => ({
  ResponsiveContainer: jest.fn().mockImplementation(({ children }) => children),
  PieChart: jest.fn().mockImplementation(({ children }) => children),
  Pie: jest.fn().mockImplementation(({ children }) => children),
  Label: jest.fn().mockImplementation(({ children }) => children),
  Tooltip: jest.fn().mockImplementation(({ children }) => children),
  Legend: jest.fn().mockImplementation(({ children }) => children),
  Bar: jest.fn().mockImplementation(({ children }) => children),
  BarChart: jest.fn().mockImplementation(({ children }) => children),
  AreaChart: jest.fn().mockImplementation(({ children }) => children),
  Area: jest.fn().mockImplementation(({ children }) => children),
  Column: jest.fn().mockImplementation(({ children }) => children),
}));
