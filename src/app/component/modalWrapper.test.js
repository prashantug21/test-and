import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ModalWrapper from "./modalWrapper";
import axios from "axios";
import { act } from 'react';
// Mock Axios
jest.mock("axios");

// Mock AntD Select
jest.mock("antd", () => {
    const antd = jest.requireActual("antd");
    return {
        ...antd,
        Select: ({ options, ...props }) => (
            <select data-testid="mock-select" {...props}>
                {options?.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        ),
    };
});

describe("ModalWrapper", () => {
    const mockSetOpen = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render the modal when open', async () => {
        // Mock the axios.get request
        axios.get.mockResolvedValue({
            data: {
                success: true,
                data: { memes: [{ id: 1, name: "One Does Not Simply" }, { id: 2, name: "Ancient Aliens" }] }
            }
        });

        // Render the component
        render(<ModalWrapper open={true} setOpen={() => { }} />);

        // Wait for the modal content to be rendered
        await waitFor(() => screen.getByText("Select a Meme"));

        // Check if the modal is rendered
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Select a Meme")).toBeInTheDocument();
    });

    it("should fetch memes and populate Select dropdown", async () => {
        // Mock API response
        const mockMemes = [
            { id: "1", name: "One Does Not Simply" },
            { id: "2", name: "Ancient Aliens" },
        ];

        axios.get.mockResolvedValue({ data: { success: true, data: { memes: mockMemes } } });

        render(<ModalWrapper open={true} setOpen={mockSetOpen} />);

        // Wait for API call to finish and Select options to be rendered
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("https://api.imgflip.com/get_memes");
        });

        // Check dropdown options
        expect(screen.getByText("One Does Not Simply")).toBeInTheDocument();
        expect(screen.getByText("Ancient Aliens")).toBeInTheDocument();
    });

    it("should close modal when clicking Return", async () => {
        axios.get.mockResolvedValue({
            data: {
                success: true,
                data: { memes: [{ id: 1, name: "One Does Not Simply" }, { id: 2, name: "Ancient Aliens" }] }
            }
        });
        render(<ModalWrapper open={true} setOpen={mockSetOpen} />);
        await waitFor(() => screen.getByText("Select a Meme"));

        act(() => {
            fireEvent.click(screen.getByText("Return"));
        });

        expect(mockSetOpen).toHaveBeenCalledWith(false);
    });

    test("should close modal when clicking Submit", async () => {
        axios.get.mockResolvedValue({
            data: {
                success: true,
                data: { memes: [{ id: 1, name: "One Does Not Simply" }, { id: 2, name: "Ancient Aliens" }] }
            }
        });

        // Render the component
        render(<ModalWrapper open={true} setOpen={mockSetOpen} />);
        await waitFor(() => screen.getByText("Select a Meme"));

        // Act to simulate user clicking the Submit button
        act(() => {
            fireEvent.click(screen.getByText("Submit"));
        });

        // Wait for the loading spinner to disappear (if any), then check if setOpen was called
        await waitFor(() => {
            expect(screen.queryByText("Submit").classList).not.toContain("ant-btn-loading");
        },);

        // Now check if setOpen was called with false
        await waitFor(() => { expect(mockSetOpen).toHaveBeenCalledWith(false); }, { timeout: 3000 });

    });
    it("should allow selecting a meme from dropdown", async () => {
        // Mock API response
        axios.get.mockResolvedValue({
            data: {
                success: true,
                data: { memes: [{ id: 1, name: "One Does Not Simply" }, { id: 2, name: "Ancient Aliens" }] }
            }
        });

        render(<ModalWrapper open={true} setOpen={mockSetOpen} />);

         await waitFor(() => screen.getByText("Select a Meme"));
        await waitFor(() => {
            expect(screen.getByTestId("mock-select")).toBeInTheDocument();
        });

        act(() => {
            fireEvent.change(screen.getByTestId("mock-select"), { target: { value: "2" } });
        });

        expect(screen.getByTestId("mock-select")).toHaveValue("2");
    });
});
