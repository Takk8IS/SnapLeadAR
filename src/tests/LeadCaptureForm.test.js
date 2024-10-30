// /SnapLeadAR/src/tests/LeadCaptureForm.test.js
import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LeadCaptureForm from "../components/LeadCaptureForm/LeadCaptureForm";
import apiService from "../services/apiService";
import analyticsService from "../services/analyticsService";

// Mock dos serviços
jest.mock("../services/apiService");
jest.mock("../services/analyticsService");
jest.mock("../utils/formUtils");

describe("LeadCaptureForm Component", () => {
    beforeEach(() => {
        // Limpa os mocks antes de cada teste
        jest.clearAllMocks();

        // Mock da API de idiomas do navegador
        Object.defineProperty(window.navigator, "language", {
            value: "en-US",
            configurable: true,
        });
    });

    test("renders form fields correctly", () => {
        render(<LeadCaptureForm onFormSubmit={() => {}} />);

        expect(
            screen.getByPlaceholderText(/enter your name/i),
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/enter your email/i),
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/your favorite color/i),
        ).toBeInTheDocument();
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    test("handles form submission successfully", async () => {
        const mockOnFormSubmit = jest.fn();
        apiService.saveFormData.mockResolvedValueOnce({ success: true });

        render(<LeadCaptureForm onFormSubmit={mockOnFormSubmit} />);

        // Preenche o formulário
        fireEvent.change(screen.getByPlaceholderText(/enter your name/i), {
            target: { value: "John Doe" },
        });
        fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
            target: { value: "john@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText(/your favorite color/i), {
            target: { value: "Blue" },
        });

        // Submete o formulário
        fireEvent.click(screen.getByRole("button"));

        // Verifica se o formulário foi processado corretamente
        await waitFor(() => {
            expect(apiService.saveFormData).toHaveBeenCalledWith({
                name: "John Doe",
                email: "john@example.com",
                favoriteColor: "Blue",
            });
            expect(mockOnFormSubmit).toHaveBeenCalled();
            expect(analyticsService.trackFormSubmit).toHaveBeenCalled();
        });
    });

    test("handles form validation errors", async () => {
        render(<LeadCaptureForm onFormSubmit={() => {}} />);

        // Tenta submeter o formulário vazio
        fireEvent.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(
                screen.getByText(/please check the form fields/i),
            ).toBeInTheDocument();
            expect(apiService.saveFormData).not.toHaveBeenCalled();
        });
    });

    test("handles API errors", async () => {
        apiService.saveFormData.mockRejectedValueOnce(new Error("API Error"));

        render(<LeadCaptureForm onFormSubmit={() => {}} />);

        // Preenche e submete o formulário
        fireEvent.change(screen.getByPlaceholderText(/enter your name/i), {
            target: { value: "John Doe" },
        });
        fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
            target: { value: "john@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText(/your favorite color/i), {
            target: { value: "Blue" },
        });

        fireEvent.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(
                screen.getByText(/error saving information/i),
            ).toBeInTheDocument();
            expect(analyticsService.trackFormError).toHaveBeenCalled();
        });
    });

    test("updates form language based on browser settings", () => {
        // Simula navegador em português
        Object.defineProperty(window.navigator, "language", {
            value: "pt-BR",
        });

        render(<LeadCaptureForm onFormSubmit={() => {}} />);

        expect(screen.getByText(/projeto snaplead ar/i)).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/digite seu nome/i),
        ).toBeInTheDocument();
    });

    test("handles existing email updates", async () => {
        apiService.checkEmailExists.mockResolvedValueOnce(true);
        apiService.updateExistingData.mockResolvedValueOnce({ success: true });

        render(<LeadCaptureForm onFormSubmit={() => {}} />);

        // Preenche o formulário com email existente
        fireEvent.change(screen.getByPlaceholderText(/enter your name/i), {
            target: { value: "John Doe Updated" },
        });
        fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
            target: { value: "existing@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText(/your favorite color/i), {
            target: { value: "Red" },
        });

        fireEvent.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(apiService.updateExistingData).toHaveBeenCalled();
            expect(
                screen.getByText(/information saved successfully/i),
            ).toBeInTheDocument();
        });
    });
});
