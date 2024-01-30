import axios from "axios";

// Enviar solicitação POST com os dados JSON
export default (url: string, data: any): void => {
    axios.post(url, data)
        .then((res: any) => {
            console.log(res)
        })
        .catch((err: any) => {
            console.error(err.toJSON())
        })
}
