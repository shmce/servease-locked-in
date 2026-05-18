import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ProviderDataProvider } from './context/ProviderDataContext';
import { ProviderAuthProvider } from './context/ProviderAuthContext';

function App() {
  return (
    <ProviderAuthProvider>
      <ProviderDataProvider>
        <style>
          {`
          /* Placeholder styles */
          input::placeholder,
          textarea::placeholder,
          select::placeholder {
            color: #9CA3AF !important;
            opacity: 1;
          }
          
          input::-webkit-input-placeholder,
          textarea::-webkit-input-placeholder {
            color: #9CA3AF !important;
            opacity: 1;
          }
          
          input::-moz-placeholder,
          textarea::-moz-placeholder {
            color: #9CA3AF !important;
            opacity: 1;
          }
          
          input:-ms-input-placeholder,
          textarea:-ms-input-placeholder {
            color: #9CA3AF !important;
            opacity: 1;
          }
          
          /* Hide number input spinners */
          input[type="number"]::-webkit-inner-spin-button,
          input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          
          input[type="number"] {
            -moz-appearance: textfield;
          }
          
          /* Custom checkbox styling */
          input[type="checkbox"] {
            appearance: none;
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border: 2px solid #00BF63;
            border-radius: 4px;
            background-color: white;
            cursor: pointer;
            position: relative;
            transition: all 0.2s ease;
          }
          
          input[type="checkbox"]:checked {
            background-color: #00BF63;
            border-color: #00BF63;
          }
          
          input[type="checkbox"]:checked::after {
            content: "";
            position: absolute;
            left: 5px;
            top: 2px;
            width: 4px;
            height: 8px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
          }
          
          input[type="checkbox"]:hover {
            border-color: #059669;
          }
          `}
        </style>
        <RouterProvider router={router} />
      </ProviderDataProvider>
    </ProviderAuthProvider>
  );
}

export default App;
