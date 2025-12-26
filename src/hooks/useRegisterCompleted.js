
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from "../firebaseConfig";

export const useRegisterCompleted = (user) => {
    const [registerCompleted, setRegisterCompleted] = useState(false)

    useEffect(() => {
        const checkPlayer = async () => {
            if (!user?.uid) return;
            const playersRef = collection(db, 'Players');
            const q = query(playersRef, where('userId', '==', user.uid));
            const snapshot = await getDocs(q);
            setRegisterCompleted(!snapshot.empty);
        };
        checkPlayer();
    }, [user]);

    return { registerCompleted }
}
