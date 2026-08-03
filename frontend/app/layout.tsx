import '../styles/globals.css';
import { Providers } from '../components/providers';
export const metadata={title:'AttendX',description:'World ID attendance, staking, and rewards on World Chain'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Providers>{children}</Providers></body></html>}
