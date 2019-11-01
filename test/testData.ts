// by updating these functions filter and preprocessing tests have to be rewritten

export function testArrayData() {
    return [
        { a: ["bf", "gf", "kf"], id: 0 },
        { a: ["ff", "ef", "af", "zf"], id: 1 },
        { a: ["ff", "gf"], id: 2 },
        { a: ["ff", "ef", "cf", "pf"], id: 3 },
        { a: ["zf", "lf", "bf"], id: 4 },
        { a: ["gf", "ef", "af", "pf"], id: 5 },
        { a: ["bf", "gf", "kf"], id: 6 },
        { a: ["pf", "ff"], id: 7 },
        { a: ["ff", "gf", "cf", "af"], id: 8 },
        { a: ["ef", "gf", "zf"], id: 9 },
    ];
}

export function testTableData() {
    return [
        { id: 0, a: "bf", b: "gf", c: "kf" },
        { id: 1, a: "ff", b: "ef", c: "af", d: "zf" },
        { id: 3, a: "ff", b: "gf" },
        { id: 3, a: "ff", b: "ef", c: "cf", d: "pf" },
        { id: 4, a: "zf", b: "lf", c: "bf" },
        { id: 5, a: "gf", b: "ef", c: "af", d: "pf" },
        { id: 6, a: "bf", b: "gf", c: "kf" },
        { id: 7, a: "pf", b: "ff" },
        { id: 8, a: "ff", b: "gf", c: "cf", d: "af" },
        { id: 9, a: "ef", b: "gf", c: "zf" },
    ];
}