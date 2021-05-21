// import axios from 'axios';

import BitstashController from '.';
import IController from './iController';
import { MESSAGE_TYPE } from '../../constants';

const INIT_VALUES = {
  getPriceInterval: undefined,
  bitstashPriceUSD: 0,
};

export default class ExternalController extends IController {
  private static GET_PRICE_INTERVAL_MS: number = 60000;

  private getPriceInterval?: number = INIT_VALUES.getPriceInterval;
  private bitstashPriceUSD: number = INIT_VALUES.bitstashPriceUSD;

  constructor(main: BitstashController) {
    super('external', main);
    this.initFinished();
  }

  public calculateBitstashToUSD = (balance: number): number => {
    return this.bitstashPriceUSD ? Number((this.bitstashPriceUSD * balance).toFixed(2)) : 0;
  }

  /*
  * Starts polling for periodic info updates.
  */
  public startPolling = async () => {
    await this.getBitstashPrice();
    if (!this.getPriceInterval) {
      this.getPriceInterval = window.setInterval(() => {
        this.getBitstashPrice();
      }, ExternalController.GET_PRICE_INTERVAL_MS);
    }
  }

  /*
  * Stops polling for the periodic info updates.
  */
  public stopPolling = () => {
    if (this.getPriceInterval) {
      clearInterval(this.getPriceInterval);
      this.getPriceInterval = undefined;
    }
  }

  /*
  * Gets the current Bitstash market price.
  */
  private getBitstashPrice = async () => {
    try {
 //     const jsonObj = await axios.get('https://api.coinmarketcap.com/v2/ticker/1684/');
      this.bitstashPriceUSD = 0.0148; /* jsonObj.data.data.quotes.USD.price; */

      if (this.main.account.loggedInAccount
        && this.main.account.loggedInAccount.wallet
        && this.main.account.loggedInAccount.wallet.info
      ) {
        const bitstashUSD = this.calculateBitstashToUSD(this.main.account.loggedInAccount.wallet.info.balance);
        this.main.account.loggedInAccount.wallet.bitstashUSD = bitstashUSD;

        chrome.runtime.sendMessage({
          type: MESSAGE_TYPE.GET_STASH_USD_RETURN,
          bitstashUSD,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
}
