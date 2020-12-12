import 'index.css';
import '@tachyons/css/tachyons.min.css';
import '@font-awesome/css/font-awesome.min.css';
import { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp