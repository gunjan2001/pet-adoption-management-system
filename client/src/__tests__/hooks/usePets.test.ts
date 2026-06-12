import { usePets } from "@/hooks/usePets";
import { petsApi } from "@/lib/api/pets.api";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/pets.api");

const mockResponse = {
  data: [{
    id: 1,
    name: "Buddy",
    species: "dog",
    breed: "Labrador",
    age: 3,
    gender: "male" as const,
    description: "Friendly dog",
    status: "available" as const,
    image: "image.jpg",
    imageUrl: "image.jpg",
    images: [{ id: 1, url: "image.jpg", sequence: 1 }],
    adoptionFee: "0.00",
    adoptedAt: null,
    adoptedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }],
  pagination: { total: 1, totalPages: 1, page: 1, limit: 12 },
};

describe("usePets", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns loading true on initial render", () => {
    vi.mocked(petsApi.getAll).mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => usePets());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.pets).toEqual([]);
  });

  it("returns pets after successful fetch", async () => {
    vi.mocked(petsApi.getAll).mockResolvedValue(mockResponse);
    const { result } = renderHook(() => usePets());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.pets).toHaveLength(1);
    expect(result.current.pets[0].name).toBe("Buddy");
    expect(result.current.error).toBeNull();
  });

  it("sets error on fetch failure", async () => {
    vi.mocked(petsApi.getAll).mockRejectedValue({
      response: { data: { message: "Failed to load pets" } },
    });
    const { result } = renderHook(() => usePets());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("Failed to load pets");
    expect(result.current.pets).toEqual([]);
  });

  it("refetch increments tick and re-fetches", async () => {
    vi.mocked(petsApi.getAll).mockResolvedValue(mockResponse);
    const { result } = renderHook(() => usePets());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    result.current.refetch();
    await waitFor(() => expect(vi.mocked(petsApi.getAll)).toHaveBeenCalledTimes(2));
  });

  it("does not set error for aborted requests", async () => {
    const abortError = new Error("canceled");
    abortError.name = "CanceledError";
    vi.mocked(petsApi.getAll).mockRejectedValue(abortError);
    const { result } = renderHook(() => usePets());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull(); // aborts are silent
  });
});