// TODO: implement a samples.test.ts to make sure these are all valid after library updates

export const XOR = `
const and = microchip.registerGate('and', 2, 1);
const nand = microchip.registerGate('nand', 2, 1);
const or = microchip.registerGate('or', 2, 1);

const xor = microchip.registerChipSingleOut((a: Signal, b: Signal): Signal => {
  return and(nand(a, b), or(a, b));
});

const main = xor;
`;

export const SRLatch = `
const nand = microchip.registerGate('nand', 2, 1);
const and = microchip.registerGate('and', 2, 1);
const or = microchip.registerGate('or', 2, 1);

const srLatch = microchip.registerChip(
  (set: Signal, reset: Signal): [Signal, Signal] => {
    const qNot = nullSignal();
    const q = nullSignal();

    copySignal(nand(set, qNot), q);
    copySignal(nand(reset, q), qNot);
    return [q, qNot];
  },
  { name: 'SR Latch', inputNames: ['Set', 'Reset'], outputNames: ['Q', '~Q'] },
);

const main = srLatch;
`;

export const FlipFlop = `
// I've gotten my lazy ass to work on this yet.
`;

export const Complex = `
// I've gotten my lazy ass to work on this yet.
`;
