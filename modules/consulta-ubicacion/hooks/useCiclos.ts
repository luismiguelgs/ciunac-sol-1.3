import { apiFetch } from "@/lib/api.service";
import React from "react";

interface ICiclo {
    id: number;
    nombre: string;
}

const useCiclos = () => {
    const [data, setData] = React.useState<ICiclo[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const res = await apiFetch('ciclos', 'GET')
            setData(res as ICiclo[]);
            setLoading(false);
        };
        fetchData();
    }, [data]);

    return { data, loading, setData };
};

export default useCiclos;
