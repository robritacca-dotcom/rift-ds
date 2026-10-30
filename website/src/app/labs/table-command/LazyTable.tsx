'use client';

import dynamic from 'next/dynamic';

/* Browser only: the server would build all the rows just to draw a first page. */
const LazyTable = dynamic(() => import('./CommandTable'), { ssr: false });
export default LazyTable;
