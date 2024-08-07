import 'react-toastify/dist/ReactToastify.css';
import 'simplebar-react/dist/simplebar.min.css';
import 'flatpickr/dist/themes/light.css';
import 'react-svg-map/lib/index.css';
import 'leaflet/dist/leaflet.css';
import './scss/app.scss';
import AuthProvider from '@/context/AuthContext';
import ThemeProvider from './theme-provider';
import { ToastContainer } from 'react-toastify';

export const metadata = {
  title: 'Xellerates',
  description: 'Global platform for startups to be investment ready',
  icons: {
    icon: '/assets/images/logo/favicon.png', // Path to your SVG icon
  },
};

export default function RootLayout({ children }) {
  return (
    <>
      <html lang='en'>
        <body className='font-inter  custom-tippy dashcode-app'>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <ToastContainer />
            </AuthProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
