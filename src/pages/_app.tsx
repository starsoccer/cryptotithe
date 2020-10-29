import '../../index.css';
import '../../node_modules/tachyons/css/tachyons.min.css';
import '../../node_modules/font-awesome/css/font-awesome.min.css';
import { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp