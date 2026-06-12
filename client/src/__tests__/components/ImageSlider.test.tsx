import ImageSlider from "@/components/ImageSlider";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const images = [
  { id: 1, url: "https://example.com/dog1.jpg" },
  { id: 2, url: "https://example.com/dog2.jpg" },
  { id: 3, url: "https://example.com/dog3.jpg" },
];

describe("ImageSlider", () => {
  it("renders paw placeholder when no images", () => {
    render(<ImageSlider images={[]} alt="test" />);
    expect(screen.getByText("🐾")).toBeInTheDocument();
  });

  it("renders single image without navigation", () => {
    render(<ImageSlider images={[images[0]]} alt="test" />);
    expect(screen.queryByLabelText("Next image")).not.toBeInTheDocument();
  });

  it("renders all thumbnails for multiple images", () => {
    render(<ImageSlider images={images} alt="dog" />);
    expect(screen.getAllByAltText(/thumbnail/i)).toHaveLength(3);
  });

  it("shows correct counter pill", () => {
    render(<ImageSlider images={images} alt="dog" />);
    // Swiper exposes the counter as aria-label on the active slide (role="group")
    expect(screen.getByRole("group", { name: "1 / 3" })).toBeInTheDocument();
  });
});