// TODO: implement a samples.test.ts to make sure these are all valid after library updates

import type { Tuple } from "../../../microchip-dsl/lib/utils";

export const XOR = `
const and = microchip.registerGate('and', 2, 1);
const nand = microchip.registerGate('nand', 2, 1);
const or = microchip.registerGate('or', 2, 1);

const xor = microchip.registerChipSingleOut(
  (a: Signal, b: Signal) => and(nand(a, b), or(a, b))
);

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
  { 
    name: 'SR Latch', 
    inputNames: ['Set', 'Reset'], 
    outputNames: ['Q', '~Q'], 
    color: "red"
  },
);

const main = srLatch;
`;

export const FlipFlop = `
// I'vn't gotten my lazy ass to work on this yet.
`;

export const Complex = `

const main = microchip.registerChip()
`;

export const DevSingleChipComplex = `
const nand = microchip.registerGate('nand', 2, 1);
const and = microchip.registerGate('and', 2, 1);
const or = microchip.registerGate('or', 2, 1);

const xor = microchip.registerChipSingleOut(
  (a: Signal, b: Signal) => and(nand(a, b), or(a, b)),
  { name: "XOR" }
);

const main = microchip.registerChip(
  (a: Signal, b: Signal, c: Signal): [Signal, Signal] => 
    [xor(and(a, b), nullSignal()), xor(xor(a, b), c)]
);
`;

export const DevSingleChipSimple = `
const nand = microchip.registerGate('nand', 2, 1);
const and = microchip.registerGate('and', 2, 1);
const or = microchip.registerGate('or', 2, 1);

const xor = microchip.registerChipSingleOut(
  (a: Signal, b: Signal) => and(nand(a, b), or(a, b))
  { name: "XOR" }
);

const main = microchip.registerChip(
  (a: Signal, b: Signal): [Signal, Signal] => 
    [xor(a, b), nullSignal()]
);
`;

export const DevSingleChipMedium = `
const nand = microchip.registerGate('nand', 2, 1);
const and = microchip.registerGate('and', 2, 1);
const or = microchip.registerGate('or', 2, 1);

const xor = microchip.registerChipSingleOut(
  (a: Signal, b: Signal) => and(nand(a, b), or(a, b))
  { name: "XOR" }
);

const main = microchip.registerChip(
  (a: Signal, b: Signal): [Signal, Signal] => 
    [xor(a, b), and(or(a, nullSignal()), b)]
);
`;

export const DevMultiChipSimple = `
const nand = microchip.registerGate('nand', 2, 1);
const and = microchip.registerGate('and', 2, 1);
const or = microchip.registerGate('or', 2, 1);

const xor = microchip.registerChipSingleOut(
  (a: Signal, b: Signal) => and(nand(a, b), or(a, b)),
  { name: "XOR" }
);

const addBits = microchip.registerChip(
  (a: Signal, b: Signal, carry: Signal): [Signal, Signal] => {
    const digit0NoCarryIn = xor(a, b);
    const carryOutNoCarryIn = and(a, b);
    return [
      xor(carry, digit0NoCarryIn),
      or(carryOutNoCarryIn, and(carry, digit0NoCarryIn))
    ];
  },
  {
    name: "1-Bit Adder",
    inputNames: ["A", "B", "Carry In"],
    outputNames: ["Out", "Carry Out"],
  }
)

const main = addBits;
`;

export const DevMultiChipComplex = `
const nand = microchip.registerGate('nand', 2, 1);
const and = microchip.registerGate('and', 2, 1);
const or = microchip.registerGate('or', 2, 1);

const xor = microchip.registerChipSingleOut(
  (a: Signal, b: Signal) => and(nand(a, b), or(a, b)),
  { name: "XOR" }
);

const addBitsNoCarry = microchip.registerChip(
  (a: Signal, b: Signal): [Signal, Signal] => 
    [xor(a, b), and(a, b)],
  {
    name: "Simple Adder",
    inputNames: ["A", "B"],
    outputNames: ["Out", "Carry"],
  }
)

const addBits = microchip.registerChip(
  (a: Signal, b: Signal, carry: Signal): [Signal, Signal] => {
    const digit0NoCarryIn = xor(a, b);
    const carryOutNoCarryIn = and(a, b);
    return [
      xor(carry, digit0NoCarryIn),
      or(carryOutNoCarryIn, and(carry, digit0NoCarryIn))
    ];
  },
  {
    name: "1-Bit Adder",
    inputNames: ["A", "B", "Carry In"],
    outputNames: ["Out", "Carry Out"],
  }
)

const fourBitAdder = microchip.registerChip(
  (
    a1: Signal, a2: Signal, a3: Signal, a4: Signal,
    b1: Signal, b2: Signal, b3: Signal, b4: Signal,
  ): Tuple<Signal, 5> => {  
    const [a, b] = [[a1, a2, a3, a4], [b1, b2, b3, b4]];
    let [out0, carry] = addBitsNoCarry(a[0], b[0]);
    const outBits = [out0];
    for (let i = 1; i < 4; i++) {
      const result = addBits(a[i], b[i], carry);
      outBits.push(result[0]);
      carry = result[1];
    }
    return [...outBits, carry]
  }, {
    name: "4-Bit Adder",
    inputNames: [
      ...(new Array(4).map((_, idx) => \`a\${idx}\`)),
      ...(new Array(4).map((_, idx) => \`b\${idx}\`))
    ]
    outputNames: [new Array(4).map((_, idx) => \`Digit\${idx}\`), "Carry"]
  }
);

const main = fourBitAdder;
`;
