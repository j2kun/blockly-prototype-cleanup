function combinations(set, k) {
  set = [...set];

  if (k > set.length|| k <= 0) {
    return [];
  }

  if (k == set.length || k == set.size) {
    return [set];
  }

  if (k == 1) {
    return set.map(elt => [elt]);
  }

  let combs = [];
  let tailCombs = [];
  for (let i = 0; i <= set.length - k + 1; i++) {
    tailCombs = combinations(set.slice(i + 1), k - 1);
    for (let j = 0; j < tailCombs.length; j++) {
      combs.push([set[i], ...tailCombs[j]]);
    }
  }

  return combs;
}

module.exports = {
  combinations,
};
