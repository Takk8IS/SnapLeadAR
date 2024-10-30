// // /SnapLeadAR/src/App.js
// import React, { Suspense } from 'react';
// import LoadingModal from './components/LoadingModal/LoadingModal.jsx';
// import SnapCamera from './pages/SnapCamera/SnapCamera.jsx';
// import './App.css';

// const App = () => {
//     return (
//         <div className="App">
//             <Suspense fallback={<LoadingModal isVisible={true} />}>
//                 <SnapCamera />
//             </Suspense>
//         </div>
//     );
// };

// export default App;

// /SnapLeadAR/src/App.js
import React, { Suspense, lazy } from 'react';
import LoadingModal from './components/LoadingModal/LoadingModal.jsx';
import './App.css';

// Lazy load do componente SnapCamera
const SnapCamera = lazy(() => import('./pages/SnapCamera/SnapCamera.jsx'));

const App = () => {
    return (
        <div className="App">
            <Suspense fallback={<LoadingModal isVisible={true} />}>
                <SnapCamera />
            </Suspense>
        </div>
    );
};

export default App;
