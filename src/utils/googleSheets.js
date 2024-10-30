// src/utils/googleSheets.js
import axios from "axios";

export async function appendToSheet(data) {
    try {
        const response = await axios.post(
            `${process.env.REACT_APP_SERVER_URL}/snapleadar/collect-lead`,
            data,
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            // O servidor respondeu com um status diferente de 2xx
            console.error(
                "Erro ao enviar dados para o servidor:",
                error.response.data.message,
            );
            throw new Error(error.response.data.message);
        } else if (error.request) {
            // A requisição foi feita, mas não houve resposta
            console.error("Sem resposta do servidor:", error.request);
            throw new Error(
                "Sem resposta do servidor. Tente novamente mais tarde.",
            );
        } else {
            // Algo aconteceu na configuração da requisição que desencadeou um erro
            console.error("Erro na configuração da requisição:", error.message);
            throw new Error("Erro ao enviar dados. Tente novamente.");
        }
    }
}
