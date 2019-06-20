
export const length = (x, y) => {

  return Math.sqrt((x * x) + (y * y));
};

export const distance = (p0, p1) => {

  return length((p1.x - p0.x), (p1.y - p0.y));
};