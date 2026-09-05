import { expect, test } from "bun:test";
import { isCompleteOutfit } from "../src/apps/enselora/outfit-selection";
const categories = new Map(Object.entries({ dress: "dresses", jumpsuit: "one_piece", top: "tops", trousers: "bottoms", shoes: "shoes", home: "other", coat: "outerwear", bag: "bags", accessory: "accessories", invalid: "constructor" }));
test("dresses and jumpsuits are mutually exclusive complete bases", () => {
  for (const ids of [["dress", "shoes"], ["jumpsuit", "coat"], ["top", "trousers"], ["top", "trousers", "shoes", "coat"]]) expect(isCompleteOutfit(ids, categories)).toBe(true);
  for (const ids of [["dress", "jumpsuit"], ["dress", "top"], ["dress", "trousers"], ["top", "trousers", "home"], ["shoes", "coat"], ["top", "shoes"], ["dress", "bag", "accessory"], ["dress", "missing"], ["dress", "invalid"]]) expect(isCompleteOutfit(ids, categories)).toBe(false);
});
test("learned rejected combinations cannot be returned by AI", () => {
  expect(isCompleteOutfit(["dress", "shoes"], categories, [["dress", "shoes"]])).toBe(false);
  expect(isCompleteOutfit(["top", "trousers", "shoes"], categories, [["dress", "shoes"]])).toBe(true);
});
