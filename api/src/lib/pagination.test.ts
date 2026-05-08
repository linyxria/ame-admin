import { describe, expect, test } from "bun:test"
import { parsePagination } from "./pagination"

describe("parsePagination", () => {
  test("uses defaults for empty input", () => {
    expect(parsePagination({})).toEqual({ page: 1, pageSize: 20, offset: 0 })
  })

  test("clamps invalid values", () => {
    expect(parsePagination({ page: "-3", pageSize: "0" })).toEqual({
      page: 1,
      pageSize: 20,
      offset: 0,
    })
  })

  test("caps page size and calculates offset", () => {
    expect(parsePagination({ page: "3", pageSize: "500" })).toEqual({
      page: 3,
      pageSize: 100,
      offset: 200,
    })
  })
})
