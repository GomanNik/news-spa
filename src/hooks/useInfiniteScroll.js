import { useEffect, useRef } from 'react';


export function useInfiniteScroll(callback, disabled){
    const sentinelRef = useRef(null);


    useEffect(() => {
        if(disabled) return;
        const el = sentinelRef.current;
        if(!el) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting){
                    callback();
                }
            });
        }, { rootMargin: '200px' });


        io.observe(el);
        return () => io.disconnect();
    }, [callback, disabled]);


    return { sentinelRef };
}