# CryptoTithe - [![Build Status](https://travis-ci.org/starsoccer/cryptotithe.svg?branch=master)](https://travis-ci.org/starsoccer/cryptotithe) [![Coverage Status](https://coveralls.io/repos/github/starsoccer/cryptotithe/badge.svg?branch=master)](https://coveralls.io/github/starsoccer/cryptotithe?branch=master) [![Build Status](https://david-dm.org/starsoccer/cryptotithe.svg)](https://github.com/starsoccer/cryptotithe)

While you may be thinking this is just another crypto tax app, unlike all the crypto tax apps that currently exist, you do not upload any data to a centralized 3rd party. All your data is stored locally and no data is sent to any 3rd parties. 

In the desktop(electron) version, The only external requests made are to `cryptocompare.com` in order to get USD values for calculating gains.  In the future hopefully you will be able to just provide a file with the USD rate and no external requests will be needed.

In the web version linked below, besides for requests to `cryptocompare.com`, requests are also made to `unpkg.com` for some css and icons.

[Demo - Vercel](https://cryptotithe-master.vercel.app/)

[Demo - ipfs(infura)](https://ipfs.infura.io/ipfs/QmegEWdax5CxHEEkmgG18sptTb4RyKzWgmHUbDYsTJmDSC)

## How to Get Started(desktop)
  1. Clone the repo or download as a zip
  2. Run `yarn`
  3. Run `yarn run start`
