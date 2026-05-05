import React from "react";
import { resourceApiRepository } from '@/modules/shared/infrastructure/api/resource-api.repository';

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
            const res = await resourceApiRepository.list<ICiclo>('ciclos')
            setData(res as ICiclo[]);
            setLoading(false);
        };
        fetchData();
    }, []);

    return { data, loading, setData };
};

export default useCiclos;
