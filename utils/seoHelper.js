import { PAGE_NAME } from './constants.js';

function seoHeadTagValues(page, param1_symbol, param2, param3) {
  switch (page) {
    case PAGE_NAME.REGISTER:
      return {
        title: 'Register for NiftyInvest | Create Your Account Today',
        displayTitle: 'Register',
        description:
          'Sign up for Nifty Invest to access exclusive market insights, investment advice, and financial tools. Join our community to stay updated on the latest trends and make informed investment decisions.',
        keywords:
          'NiftyInvest registration, create account, sign up, investment tools, financial resources, market insights, investment recommendations',
      };
    case PAGE_NAME.LOGIN:
      return {
        title: 'Login to NiftyInvest | Access Your Investment Account',
        displayTitle: 'Log In',
        description:
          'Log in to your NiftyInvest account to access investment tools, financial data, and market insights. Securely manage your investments and stay updated with the latest market trends.',
        keywords:
          'NiftyInvest login, sign in, investment account access, financial data, market insights, secure login, investment management',
      };
    case PAGE_NAME.FORGOT_PASS:
      return {
        title: 'Forgot Password | NiftyInvest - Recover Your Account',
        displayTitle: 'Forgot your password',
        description:
          'Need to reset your password? Use our easy password recovery process to regain access to your NiftyInvest account. Follow the steps to reset your password and continue managing your investments seamlessly.',
        keywords:
          'NiftyInvest, forgot password, password recovery, account access, reset password, investment account, account recovery',
      };
    case PAGE_NAME.HOME:
      return {
        title:
          'Nifty Invest | Comprehensive Investment Insights and Market Analysis ',
        displayTitle: 'Home',
        description:
          'Nifty Invest gives you historical options data, max pain, F&O lot size, put-call ratio, live stock news, filter based on technical data, real-time nifty indices, nifty indices, sensex indices and many others interesting tools to help you in your trading journey.',
        keywords:
          'nifty investment advice, nifty investment analysis, nifty investment opportunities, nifty put call ratio, how to invest in nifty, pre open market analysis, post market analysis, nifty invest stock news, nifty invest chart, nifty investment insights, nifty investment guide, max pain, option chain, option chain for nifty, nifty invest, put call ratio, historical option chain data, f&o lot size, charts, financial reports, screeners, live stock news, stock technicals',
      };
    case PAGE_NAME.LOT_SIZE:
      return {
        title: 'Lot-Size | Nifty Invest',
        displayTitle: 'Lot Size',
        description:
          'This page shows the available lot size for stocks traded in options and futures',
        keywords:
          'Sgx nifty today, Max Pain, Put Call Ratio,historical Option Chain data, F&O Lot size, Charts, financial reports, screeners, live stock news, stock techinals',
      };
    case PAGE_NAME.SGX_NIFTY:
      return {
        title: 'SGX Nifty Live | SGX Nifty Today | Nifty Invest',
        displayTitle: 'SGX Nifty',
        description:
          'Check SGX Nifty Future or Sgx nifty index today live price. SGX Nifty is Singapore Stock Exchange Nifty. It is a very popular derivative product of Singapore Exchange as it allows foreign investors to take a position in Indian Market.',
        keywords:
          'Sgx nifty live, Sgx nifty today, Sgx nifty index, Sgx nifty now, Sgx nifty real time, sgx nifty update, Sgx nifty share price, Sgx nifty news',
      };
    case PAGE_NAME.MAX_PAIN_TABLE:
      return {
        title:
          'Max Pain Analysis for All Stocks | NiftyInvest - Comprehensive Options Data',
        displayTitle: 'Max pain Table',
        description:
          'Explore max pain points for all stocks on NiftyInvest. Access detailed analysis and charts to understand the price levels where the most financial losses occur for options holders at expiration.',
        keywords:
          'max pain, all stocks, NiftyInvest, options data, financial analysis, options trading, stock analysis, market sentiment, price levels',
      };
    case PAGE_NAME.MAX_PAIN:
      return {
        title: 'Max Pain Analysis | NiftyInvest - Options Market Insights',
        displayTitle: 'Max pain',
        description:
          'Max pain, or the max pain price, refers to the strike price with the highest number of open put and call contracts. It is the price at which the stock would cause the greatest financial losses for the largest number of option holders at expiration. Explore max pain analysis on NiftyInvest to gain insights into market sentiment and options trading.',
        keywords:
          'max pain analysis, options market, NiftyInvest, investment decisions, market sentiment, options trading, financial analysis',
      };
    case PAGE_NAME.MAX_PAIN_SYMBOL:
      return {
        title: `${param1_symbol} (${param2}) Max Pain Analysis | NiftyInvest - Options Market Insights`,
        displayTitle: 'Max pain',
        description: `Max pain, or the max pain price for ${param1_symbol} (${param2}), is the strike price with the most open contract puts and calls - and the price at which the stock would cause financial losses for the largest number of option holders at expiration`,
        keywords: `${param1_symbol}, ${param2}, ${param1_symbol} max pain, ${param2} max pain, max pain analysis, max pain, options market, NiftyInvest, investment decisions, market sentiment, options trading, financial analysis`,
      };
    case PAGE_NAME.PCR_TABLE:
      return {
        title:
          'Put-Call Ratio for All Stocks | NiftyInvest - Comprehensive Market Analysis',
        displayTitle: 'pull-call-ratio',
        description: `Explore the Put-Call Ratio (PCR) for all stocks on NiftyInvest. Access detailed data and analysis to understand market sentiment by comparing put and call option volumes across various stocks.`,
        keywords:
          'Put-Call Ratio, all stocks, NiftyInvest, market analysis, options data, PCR, stock analysis, market sentiment, put volume, call volume',
      };
    case PAGE_NAME.PCR:
      return {
        title:
          'Put-Call Ratio | NiftyInvest - Market Sentiment and Options Analysis',
        displayTitle: 'pull-call-ratio',
        description: `Explore the Put-Call Ratio (PCR) on NiftyInvest. The Put-Call Ratio (PCR) measures put volume relative to call volume, helping assess market sentiment. Put options are used to hedge against market weakness or speculate on declines, while call options indicate expectations of a rise.`,
        keywords:
          'Put-Call Ratio, PCR, market sentiment, options analysis, NiftyInvest, put volume, call volume, financial analysis, put call ratio nse, put call ratio live',
      };
    case PAGE_NAME.PCR_SYMBOL:
      return {
        title: `${param1_symbol} (${param2}) Put-Call Ratio | NiftyInvest - Options Market Insights`,
        displayTitle: 'pull-call-ratio',
        description: `The Put-Call Ratio (PCR) for ${param1_symbol} (${param2}) is an indicator showing the ratio of put volume to call volume. This metric helps gauge market sentiment by comparing the number of put options, which are used to hedge against market declines or speculate on downturns, to call options.`,
        keywords: `${param1_symbol}, ${param2},${param1_symbol} put-call ratio, ${param2} put-call ratio, put-call ratio, options market, NiftyInvest, market sentiment, options analysis, financial data, put call ratio nse, put call ratio live`,
      };
    case PAGE_NAME.OPTION_CHAIN:
      return {
        title: `Option Chain | NiftyInvest - Detailed Options Data and Analysis`,
        displayTitle: 'Option Chain',
        description:
          'Explore the option chain on NiftyInvest to access comprehensive data on call and put options. Analyze strike prices, expiration dates, and trading volumes to make informed decisions in options trading.',
        keywords:
          'option chain, NiftyInvest, options data, call options, put options, strike prices, expiration dates, trading volumes, options analysis, option chain nse, option chain live',
      };
    case PAGE_NAME.OPTION_CHAIN_SYMBOL:
      return {
        title: `${param1_symbol} (${param2}) Option Chain | NiftyInvest - Detailed Options Data`,
        displayTitle: 'Option Chain',
        description: `Explore the option chain for ${param1_symbol} (${param2}) on NiftyInvest. Access comprehensive data on call and put options, including strike prices, expiration dates, and trading volumes, to make informed trading decisions.`,
        keywords: `${param1_symbol}, ${param2}, ${param1_symbol} option chain,${param3} expiry, ${param2} option chain, option chain for ${param2}, option chain, NiftyInvest, options data, call options, put options, strike prices, expiration dates, trading volumes, options analysis`,
      };
    case PAGE_NAME.OPTION_CHAIN_STRIKE:
      return {
        title: `${param1_symbol} (${param2}) Option Chain - Strike Price ${param3} | NiftyInvest - Detailed Options Data & Historical Records`,
        displayTitle: 'Option Chain',
        description: `Explore the option chain for ${param1_symbol} (${param2}) at a strike price of ${param3} on NiftyInvest. Access comprehensive data on call and put options, including trading volumes and expiration dates, to refine your trading strategy.`,
        keywords: `${param1_symbol}, ${param2}, option chain, strike price ${param3}, NiftyInvest, options data, call options, put options, trading volumes, expiration dates, historical records, options analysis`,
      };
    case PAGE_NAME.INDIAN_NEWS:
      return {
        title: 'Indian News | NiftyInvest - Latest Updates and Market Insights',
        displayTitle: '',
        description: `Stay updated with the latest Indian news on NiftyInvest. Access comprehensive coverage of market developments, economic updates, and financial news to stay informed and make better investment decisions.`,
        keywords:
          'Indian news, latest updates, NiftyInvest, market insights, economic news, financial news, investment decisions, market developments, nifty invest stock news',
      };
    case PAGE_NAME.STOCK_NEWS:
      return {
        title: 'Stock News | NiftyInvest - Latest Updates and Market Insights',
        displayTitle: '',
        description: `Stay informed with the latest stock news on NiftyInvest. Access up-to-date information on stock market trends, corporate announcements, and financial developments to enhance your investment strategies.`,
        keywords:
          'stock news, latest updates, NiftyInvest, market insights, stock market trends, corporate announcements, financial developments, investment strategies',
      };
    case PAGE_NAME.PRE_ANALYSIS:
      return {
        title:
          'Pre-Open Market Analysis | NiftyInvest - Early Insights and Market Trends',
        displayTitle: 'Pre-Open Market Analysis',
        description:
          'Get early insights with NiftyInvest’s pre-open market analysis. Explore pre-market trends, potential stock movements, and key factors influencing the market before it opens to make informed trading decisions.',
        keywords:
          'pre-open market analysis, NiftyInvest, early market insights, market trends, pre-market analysis, stock movements, trading decisions, financial analysis',
      };
    case PAGE_NAME.POST_ANALYSIS:
      return {
        title:
          'Post-Close Market Analysis | NiftyInvest - End-of-Day Insights and Market Trends',
        displayTitle: 'Post-Close Market Analysis',
        description: `Review the day’s market activity with NiftyInvest’s post-close market analysis. Access detailed insights into stock movements, market trends, and key events that influenced the market after it closes.`,
        keywords:
          'post-close market analysis, NiftyInvest, end-of-day insights, market trends, stock movements, financial analysis, daily market review, trading insights',
      };
    case PAGE_NAME.COMPANY_ABOUT:
      return {
        title:
          'Company Profiles | NiftyInvest - Comprehensive Business Information',
        displayTitle: 'Company',
        description:
          'Explore detailed profiles of various companies on NiftyInvest. Get insights into their history, financials, and key executives to make informed investment decisions.',
        keywords:
          'NiftyInvest, company profiles, business information, company details, financial insights, executive information, investment research',
      };
    case PAGE_NAME.COMPANY_CHART:
      return {
        title: 'Company Chart | NiftyInvest - Financial Data Visualizations',
        displayTitle: 'Company',
        description:
          'Access interactive charts on Nifty Invest to analyze market trends and performance. Our detailed charts provide valuable insights for making informed investment decisions.',
        keywords:
          'NiftyInvest, company charts, financial data, data visualizations, investment analysis, market trends, company financials',
      };
    case PAGE_NAME.COMPANY_FINANCIALS:
      return {
        title: 'Company Financials | NiftyInvest - In-Depth Financial Analysis',
        displayTitle: 'Company',
        description:
          'Access detailed financial information for a range of companies on NiftyInvest. Explore comprehensive financial statements, key metrics, and historical performance to guide your investment decisions.',
        keywords:
          'NiftyInvest, company charts, financial data, data visualizations, investment analysis, market trends, company financials',
      };
    case PAGE_NAME.COMPANY_TECHNICAL:
      return {
        title: 'Technical Analysis | NiftyInvest - In-Depth Market Insights',
        displayTitle: 'Company',
        description:
          'Access comprehensive technical analysis of various companies on NiftyInvest. Explore charts, indicators, and patterns to make informed investment decisions based on market trends and technical data.',
        keywords:
          'technical analysis, NiftyInvest, market insights, company analysis, technical indicators, chart patterns, investment decisions, market trends',
      };
    case PAGE_NAME['COMPANY_RELATED-NEWS']:
      return {
        title:
          'Related Company News | NiftyInvest - Latest Updates and Insights',
        displayTitle: 'Company',
        description:
          'Stay updated with the latest news and updates related to various companies on NiftyInvest. Explore recent developments, market news, and important announcements that could impact your investments.',
        keywords:
          'NiftyInvest, company news, latest updates, market news, investment insights, company announcements, financial news',
      };
    case PAGE_NAME.COMPANY_SYMBOL_ABOUT:
      return {
        title: `${param1_symbol} (${param2}) Company Profile | NiftyInvest - Detailed Business Overview`,
        displayTitle: 'Company',
        description: `Explore the comprehensive profile of ${param1_symbol} (${param2}) on NiftyInvest. Access detailed information including financial performance, executive team, company history, and key business metrics.`,
        keywords: `${param1_symbol},${param2}, ${param1_symbol} profile, company overview, business details, financial performance, executive team, ${param1_symbol} history, investment research`,
      };
    case PAGE_NAME.COMPANY_SYMBOL_CHART:
      return {
        title: `${param1_symbol} (${param2}) Financial Charts | NiftyInvest - Visual Data Analysis`,
        displayTitle: 'Company',
        description: `Explore the comprehensive profile of ${param1_symbol} (${param2}) on NiftyInvest. Access detailed information including financial performance, executive team, company history, and key business metrics.`,
        keywords: `${param1_symbol},${param2}, ${param1_symbol} financial charts, ${param2} financial charts, financial data, data visualizations, investment analysis, performance trends, NiftyInvest`,
      };
    case PAGE_NAME.COMPANY_SYMBOL_FINANCIALS:
      return {
        title: `${param1_symbol} (${param2}) Financials | NiftyInvest - Comprehensive Financial Information`,
        displayTitle: 'Company',
        description: `Access detailed financial information for ${param1_symbol} (${param2}) on NiftyInvest. Explore financial statements, key metrics, and historical performance to make informed investment decisions and understand ${param1_symbol} (${param2})'s financial health`,
        keywords: `${param1_symbol},${param2}, ${param2} financials, ${param1_symbol} financials, financial statements, key metrics, historical performance, financial analysis, NiftyInvest`,
      };
    case PAGE_NAME.COMPANY_SYMBOL_TECHNICAL:
      return {
        title: `${param1_symbol} (${param2}) Technical Analysis | NiftyInvest`,
        displayTitle: 'Company',
        description: `Access comprehensive technical analysis for ${param1_symbol} (${param2}) on NiftyInvest. Explore detailed charts, indicators, and patterns to make informed investment decisions based on market trends and technical data.`,
        keywords: `${param1_symbol}, ${param2}, technical analysis, ${param1_symbol} technical analysis, ${param2} technical analysis, NiftyInvest, market insights, technical indicators, chart patterns, investment decisions, market trends`,
      };
    case PAGE_NAME['COMPANY_SYMBOL_RELATED-NEWS']:
      return {
        title: `${param1_symbol} (${param2}) Related News | NiftyInvest - Latest Updates`,
        displayTitle: 'Company',
        description: `Stay informed with the latest news and updates related to ${param1_symbol} (${param2}) on NiftyInvest. Explore recent developments, market news, and significant announcements impacting ${param1_symbol} (${param2}).`,
        keywords: `${param1_symbol},${param2}, ${param2} news, ${param1_symbol} news, company updates, market news, investment insights, ${param1_symbol} ${param2} announcements, NiftyInvest, Nifty Investment Advice, Nifty Investment Insights`,
      };
    case PAGE_NAME.INDICES_CONSTITUENTS:
      return {
        title: `${param1_symbol} (${param2}) Constituents | NiftyInvest - Comprehensive Index Breakdown`,
        displayTitle: 'Indices',
        description: `Explore the constituents of the ${param1_symbol} (${param2}) index on NiftyInvest. Access detailed information about each component stock, including their weightings and performance metrics to better understand the index composition`,
        keywords: `${param1_symbol}, ${param1_symbol} constituents,${param2}, ${param2} constituents, index breakdown, NiftyInvest, component stocks, index performance, financial analysis, stock weightings`,
      };
    case PAGE_NAME['INDICES_CALL-CHANGE-OI-VS-PUT-CHANGE-OI']:
      return {
        title: `${param1_symbol} (${param2}) Call Change OI vs Put Change OI | NiftyInvest - Options Activity Analysis`,
        displayTitle: 'Indices OI Analysis',
        description: `Explore the call change in open interest (OI) versus put change in OI for ${param1_symbol} (${param2}) on NiftyInvest. View detailed charts and data to analyze shifts in options activity and market sentiment.`,
        keywords: `${param1_symbol}, ${param2},${param1_symbol} call change OI vs put change OI, call change OI vs put change OI, options activity, NiftyInvest, open interest change, market sentiment, financial analysis`,
      };
    case PAGE_NAME['INDICES_CALL-OI-VS-PUT-OI']:
      return {
        title: `${param1_symbol} (${param2}) Call OI vs Put OI | NiftyInvest - Detailed Options Analysis`,
        displayTitle: 'Indices OI Analysis',
        description: `Analyze the call open interest (OI) versus put OI for ${param1_symbol} (${param2}) on NiftyInvest. Access detailed charts and data to understand market sentiment and options activity.`,
        keywords: `${param1_symbol}, ${param2},${param1_symbol} call OI vs put OI, call OI vs put OI, options analysis, NiftyInvest, open interest, market sentiment, financial data`,
      };
    case PAGE_NAME['INDICES_CALL-VOLUME-VS-PUT-VOLUME']:
      return {
        title: `${param1_symbol} (${param2}) Call Volume vs Put Volume | NiftyInvest - Options Trading Insights`,
        displayTitle: 'Indices OI Analysis',
        description: `Examine the call volume compared to put volume for ${param1_symbol} (${param2}) on NiftyInvest. Access detailed charts and analytics to understand trading activity, market dynamics, and investor sentiment.`,
        keywords: `${param1_symbol}, ${param2},${param1_symbol} call volume vs put volume, call volume vs put volume, options trading, NiftyInvest, trading insights, market dynamics, investor sentiment`,
      };
    case PAGE_NAME['INDICES_CE-PE-DIFF']:
      return {
        title: `${param1_symbol} (${param2}) CE vs PE Difference | NiftyInvest - Options Analysis`,
        displayTitle: 'Indices OI Analysis',
        description: `Explore the difference between call (CE) and put (PE) options for ${param1_symbol} (${param2}) on NiftyInvest. Access detailed charts and analysis to understand the disparity and its impact on market sentiment.`,
        keywords: `${param1_symbol}, ${param2}, CE vs PE difference, options analysis, NiftyInvest, call put difference, market sentiment, financial analysis`,
      };

    case PAGE_NAME.INDICES_HISTORY_PAGECALLED:
      return {
        title: `${param1_symbol} ${param2} Historical Oi Analysis | Nifty Invest`,
        displayTitle: 'Indices History OI',
        description: `Analyze ${param1_symbol}'s Historical Oi expiring on ${param2} For trading in Options`,
        keywords: 'Indices',
      };
    default:
      return {
        title: `${page} Nifty Invest`,
        displayTitle: 'page',
        description: `Nifty Invest gives you historical options data, max pain, F&O lot size, put-call ratio, live stock news, filter based on technical data, real-time nifty indices, nifty indices, sensex indices and many others interesting tools to help you in your trading journey.`,
        keywords:
          'nifty investment advice, nifty investment analysis, nifty investment opportunities, nifty put call ratio, how to invest in nifty, pre open market analysis, post market analysis, nifty invest stock news, nifty invest chart, nifty investment insights, nifty investment guide, max pain, option chain, option chain for nifty, nifty invest, put call ratio, historical option chain data, f&o lot size, charts, financial reports, screeners, live stock news, stock technicals',
      };
    case PAGE_NAME.TRADE_JOURNAL:
      return {
        title: 'Trading Journal | Access Your trading journal from here',
        displayTitle: 'Trading Journal',
        description:
          'A trading journal is a way to track your trading performance by recording your trades which you can later review to improve your trading activity by learning from both your successful and not-so-successful trades.',
        keywords:
          'Trading Journal, Keep your records, maintain journal, add your daily entries, manage your entries',
      };
    case PAGE_NAME.JOURNAL_DASHBOARD:
      return {
        title: 'Journal Dashboard | Access Your Jounal Dashboard from here',
        displayTitle: 'Trading Journal',
        description:
          'A journal dashboard is a tool that provides insights into a journal performance and helps users make informed decisions',
        keywords:
          'Journal Dashboard, Tool that provided insights, maintain journal performance , Make informed decisions',
      };
    case PAGE_NAME.JOURNAL_ANALYSE:
      return {
        title:
          'Analyse your journal | Access Your Jounal Performance from here',
        displayTitle: 'Analyse',
        description:
          'A journal analysis is a written document that analyzes a journal article',
        keywords: 'Analyse journal',
      };
    case PAGE_NAME.JOURNAL_ADD_TRADE:
      return {
        title: 'Add your trades | Add trades from here',
        displayTitle: 'Add trades',
        description:
          'A trade journal entry is a record of a trade that includes details such as the date, time, instrument, position ,size, entry and exit points, and the result of the trade.',
        keywords: 'Add trade, Date and Time, Instrument, Position',
      };
    case PAGE_NAME.JOURNAL_EDIT_TRADE:
      return {
        title: 'Edit your trades | Edit trades from here',
        displayTitle: 'Edit trades',
        description:
          'The Edit Trades Mode allows the User to view, adjust and submit transactions for recalculation',
        keywords:
          'Edit trades,Edit Date and Time, Edit Instrument,Edit Position',
      };
    case PAGE_NAME.JOURNAL_TRADE_DETAILS:
      return {
        title: 'Trade Details | Fetch your trade details from here',
        displayTitle: 'Trade Details',
        description:
          'From here we can keep the logs of a particular trade and access the details of trade',
        keywords:
          'Trade Details, Trade Symbol, Trade Date and Time, Position, Size ',
      };
    case PAGE_NAME.JOURNAL_EXECUTION_LIST:
      return {
        title: 'Execution List | All your executions are here',
        displayTitle: 'Execution List',
        description:
          'From here we can keep the logs of all the executions done till date',
        keywords:
          'Execution Details, Delete execution, Edit execution, Get execution info ',
      };
    case PAGE_NAME.JOURNAL_STRATEGY_LIST:
      return {
        title: 'Strategy List | All your strategies are here',
        displayTitle: 'Strategy List',
        description:
          'From here we can keep the logs of all the strategies added till date',
        keywords: 'Add strategy, Edit Strategy, Manage your strategies',
      };
    case PAGE_NAME.JOURNAL_TRADE_HISTORY:
      return {
        title: 'Trade History | Keep your grouped trade history',
        displayTitle: 'Trade History',
        description: 'From here we can keep the history of grouped trades',
        keywords: 'Trade History,Grouped Trades,Computed Trades',
      };
    case PAGE_NAME.JOURNAL_GUEST:
      return {
        title: 'Journal Guest | Start using Journal',
        displayTitle: 'Journal',
        description:
          'From here you can add, execute and can maintain your daily trading history and can manage strategies',
        keywords: 'Add Trade, Execution List, Trade History, Manage Strategy ',
      };
  }
}
export { seoHeadTagValues };
