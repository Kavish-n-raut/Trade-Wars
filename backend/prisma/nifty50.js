// Top 100 Indian Stocks - 15 Major Sectors (November 2025)
const nifty50Data = [
  // 1. BANKING (8 stocks)
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking', price: 1750.30 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Banking', price: 1260.40 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', price: 820.80 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd', sector: 'Banking', price: 1895.60 },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', sector: 'Banking', price: 1145.75 },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd', sector: 'Banking', price: 1485.60 },
  { symbol: 'BANDHANBNK', name: 'Bandhan Bank Ltd', sector: 'Banking', price: 285.40 },
  { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank Ltd', sector: 'Banking', price: 95.25 },
  
  // 2. INFORMATION TECHNOLOGY (8 stocks)
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', sector: 'IT', price: 3950.75 },
  { symbol: 'INFY', name: 'Infosys Ltd', sector: 'IT', price: 1820.60 },
  { symbol: 'WIPRO', name: 'Wipro Ltd', sector: 'IT', price: 565.30 },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', sector: 'IT', price: 1850.40 },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd', sector: 'IT', price: 1685.90 },
  { symbol: 'LTIM', name: 'LTIMindtree Ltd', sector: 'IT', price: 5985.40 },
  { symbol: 'PERSISTENT', name: 'Persistent Systems Ltd', sector: 'IT', price: 5685.30 },
  { symbol: 'COFORGE', name: 'Coforge Ltd', sector: 'IT', price: 8285.60 },
  
  // 3. FMCG (8 stocks)
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', sector: 'FMCG', price: 2385.90 },
  { symbol: 'ITC', name: 'ITC Ltd', sector: 'FMCG', price: 465.25 },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd', sector: 'FMCG', price: 2285.75 },
  { symbol: 'TATACONSUM', name: 'Tata Consumer Products Ltd', sector: 'FMCG', price: 1185.40 },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd', sector: 'FMCG', price: 4985.75 },
  { symbol: 'GODREJCP', name: 'Godrej Consumer Products Ltd', sector: 'FMCG', price: 1185.60 },
  { symbol: 'DABUR', name: 'Dabur India Ltd', sector: 'FMCG', price: 685.30 },
  { symbol: 'MARICO', name: 'Marico Ltd', sector: 'FMCG', price: 685.80 },
  
  // 4. PHARMACEUTICALS (8 stocks)
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd', sector: 'Pharma', price: 1780.40 },
  { symbol: 'DIVISLAB', name: 'Divi\'s Laboratories Ltd', sector: 'Pharma', price: 5980.30 },
  { symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories Ltd', sector: 'Pharma', price: 1285.90 },
  { symbol: 'CIPLA', name: 'Cipla Ltd', sector: 'Pharma', price: 1485.50 },
  { symbol: 'TORNTPHARM', name: 'Torrent Pharmaceuticals Ltd', sector: 'Pharma', price: 3485.90 },
  { symbol: 'LUPIN', name: 'Lupin Ltd', sector: 'Pharma', price: 2185.30 },
  { symbol: 'AUROPHARMA', name: 'Aurobindo Pharma Ltd', sector: 'Pharma', price: 1485.90 },
  { symbol: 'ALKEM', name: 'Alkem Laboratories Ltd', sector: 'Pharma', price: 5685.40 },
  
  // 5. AUTOMOBILE (7 stocks)
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', sector: 'Automobile', price: 12850.80 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', sector: 'Automobile', price: 985.50 },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd', sector: 'Automobile', price: 4985.75 },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd', sector: 'Automobile', price: 4850.80 },
  { symbol: 'MANDO', name: 'Mahindra & Mahindra Ltd', sector: 'Automobile', price: 2950.90 },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd', sector: 'Automobile', price: 9850.80 },
  { symbol: 'TVSMOTOR', name: 'TVS Motor Company Ltd', sector: 'Automobile', price: 2685.40 },
  
  // 6. ENERGY (7 stocks)
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Energy', price: 1285.50 },
  { symbol: 'ONGC', name: 'Oil and Natural Gas Corporation Ltd', sector: 'Energy', price: 285.75 },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Ltd', sector: 'Energy', price: 615.60 },
  { symbol: 'ADANIGREEN', name: 'Adani Green Energy Ltd', sector: 'Energy', price: 1850.40 },
  { symbol: 'GAIL', name: 'GAIL (India) Ltd', sector: 'Energy', price: 215.60 },
  { symbol: 'IGL', name: 'Indraprastha Gas Ltd', sector: 'Energy', price: 485.60 },
  { symbol: 'PETRONET', name: 'Petronet LNG Ltd', sector: 'Energy', price: 335.80 },
  
  // 7. TELECOM (2 stocks)
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', sector: 'Telecom', price: 1650.45 },
  { symbol: 'IDEA', name: 'Vodafone Idea Ltd', sector: 'Telecom', price: 12.50 },
  
  // 8. CEMENT (5 stocks)
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', sector: 'Cement', price: 11280.90 },
  { symbol: 'GRASIM', name: 'Grasim Industries Ltd', sector: 'Cement', price: 2685.50 },
  { symbol: 'SHREECEM', name: 'Shree Cement Ltd', sector: 'Cement', price: 27850.80 },
  { symbol: 'AMBUJACEM', name: 'Ambuja Cements Ltd', sector: 'Cement', price: 685.40 },
  { symbol: 'ACC', name: 'ACC Ltd', sector: 'Cement', price: 2685.60 },
  
  // 9. METALS (5 stocks)
  { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd', sector: 'Metals', price: 685.40 },
  { symbol: 'VEDL', name: 'Vedanta Ltd', sector: 'Metals', price: 485.30 },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', sector: 'Metals', price: 165.50 },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', sector: 'Metals', price: 985.30 },
  { symbol: 'COALINDIA', name: 'Coal India Ltd', sector: 'Metals', price: 485.40 },
  
  // 10. INSURANCE (6 stocks)
  { symbol: 'SBILIFE', name: 'SBI Life Insurance Company Ltd', sector: 'Insurance', price: 1685.50 },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Company Ltd', sector: 'Insurance', price: 785.60 },
  { symbol: 'ICICIPRULI', name: 'ICICI Prudential Life Insurance Company Ltd', sector: 'Insurance', price: 685.30 },
  { symbol: 'ICICIGI', name: 'ICICI Lombard General Insurance Company Ltd', sector: 'Insurance', price: 1985.60 },
  { symbol: 'MFSL', name: 'Max Financial Services Ltd', sector: 'Insurance', price: 1185.40 },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd', sector: 'Insurance', price: 1785.60 },
  
  // 11. FINANCIAL SERVICES (6 stocks)
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', sector: 'Financial Services', price: 6850.80 },
  { symbol: 'MUTHOOTFIN', name: 'Muthoot Finance Ltd', sector: 'Financial Services', price: 1985.40 },
  { symbol: 'CHOLAMANDALAM', name: 'Cholamandalam Investment and Finance Company Ltd', sector: 'Financial Services', price: 1685.30 },
  { symbol: 'SBICARD', name: 'SBI Cards and Payment Services Ltd', sector: 'Financial Services', price: 885.40 },
  { symbol: 'MPHASIS', name: 'Mphasis Ltd', sector: 'Financial Services', price: 2985.40 },
  { symbol: 'HDFCAMC', name: 'HDFC Asset Management Company Ltd', sector: 'Financial Services', price: 4285.60 },
  
  // 12. INFRASTRUCTURE (5 stocks)
  { symbol: 'LT', name: 'Larsen & Toubro Ltd', sector: 'Infrastructure', price: 3685.30 },
  { symbol: 'ADANIPORTS', name: 'Adani Ports and Special Economic Zone Ltd', sector: 'Infrastructure', price: 1485.80 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', sector: 'Infrastructure', price: 2985.40 },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd', sector: 'Infrastructure', price: 325.60 },
  { symbol: 'NTPC', name: 'NTPC Ltd', sector: 'Infrastructure', price: 385.30 },
  
  // 13. RETAIL (3 stocks)
  { symbol: 'DMART', name: 'Avenue Supermarts Ltd', sector: 'Retail', price: 4685.40 },
  { symbol: 'TRENT', name: 'Trent Ltd', sector: 'Retail', price: 6885.60 },
  { symbol: 'FRETAIL', name: 'Future Retail Ltd', sector: 'Retail', price: 385.20 },
  
  // 14. HEALTHCARE (3 stocks)
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd', sector: 'Healthcare', price: 6985.30 },
  { symbol: 'MAXHEALTH', name: 'Max Healthcare Institute Ltd', sector: 'Healthcare', price: 985.40 },
  { symbol: 'FORTIS', name: 'Fortis Healthcare Ltd', sector: 'Healthcare', price: 485.60 },
  
  // 15. CONSUMER GOODS (9 stocks)
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', sector: 'Consumer Goods', price: 2450.50 },
  { symbol: 'TITAN', name: 'Titan Company Ltd', sector: 'Consumer Goods', price: 3540.60 },
  { symbol: 'COLPAL', name: 'Colgate Palmolive (India) Ltd', sector: 'Consumer Goods', price: 3285.40 },
  { symbol: 'VOLTAS', name: 'Voltas Ltd', sector: 'Consumer Goods', price: 1685.90 },
  { symbol: 'WHIRLPOOL', name: 'Whirlpool of India Ltd', sector: 'Consumer Goods', price: 1885.40 },
  { symbol: 'DIXON', name: 'Dixon Technologies (India) Ltd', sector: 'Consumer Goods', price: 14850.80 },
  { symbol: 'MRF', name: 'MRF Ltd', sector: 'Consumer Goods', price: 128500.40 },
  { symbol: 'HAVELLS', name: 'Havells India Ltd', sector: 'Consumer Goods', price: 1685.90 },
  { symbol: 'BOSCHLTD', name: 'Bosch Ltd', sector: 'Consumer Goods', price: 32850.60 },
  { symbol: 'PIDILITIND', name: 'Pidilite Industries Ltd', sector: 'Consumer Goods', price: 3185.40 },
  { symbol: 'BERGER', name: 'Berger Paints India Ltd', sector: 'Consumer Goods', price: 685.50 },
  { symbol: 'PAGEIND', name: 'Page Industries Ltd', sector: 'Consumer Goods', price: 42850.60 },
  { symbol: 'BALKRISIND', name: 'Balkrishna Industries Ltd', sector: 'Consumer Goods', price: 2985.80 },
  { symbol: 'ASTRAL', name: 'Astral Ltd', sector: 'Consumer Goods', price: 2185.60 },
  { symbol: 'VGUARD', name: 'V-Guard Industries Ltd', sector: 'Consumer Goods', price: 385.40 },
  { symbol: 'CROMPTON', name: 'Crompton Greaves Consumer Electricals Ltd', sector: 'Consumer Goods', price: 485.30 },
  { symbol: 'SYMPHONY', name: 'Symphony Ltd', sector: 'Consumer Goods', price: 1285.60 },
  { symbol: 'ORIENTELEC', name: 'Orient Electric Ltd', sector: 'Consumer Goods', price: 285.40 },
  { symbol: 'BATAINDIA', name: 'Bata India Ltd', sector: 'Consumer Goods', price: 1685.50 },
];

export default nifty50Data;