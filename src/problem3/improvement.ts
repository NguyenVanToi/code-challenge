// [ERROR] Missing/undefined variables and imports:
// BoxProps, useWalletBalances, usePrices, useMemo, WalletRow, classes are not defined in the snippet.

// [IMPROVEMENT]: Avoid using any type in code level, use type instead to help with type checking and ease of use and readability
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo'; // or keep that is `any` here if type is not available

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain; // [ERROR]: Add missing property
}

// [IMPROVEMENT]: Extend the WalletBalance interface to include the formatted property
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// [IMPROVEMENT]: Use Record to map the blockchain to the priority
const PRIORITY_MAP: Record<Blockchain, number> = {
  xOsmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20
};

interface Props extends BoxProps { }

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // [IMPROVEMENT]: Using MAP constant instead of switch case to improve readability and performance
  const getPriority = (blockchain: Blockchain): number => {
    return PRIORITY_MAP[blockchain] ?? -99;
  };

  // [SUGGESTION]: useMemo
  // If balances and prices are large arrays or the computation is expensive, useMemo can prevent unnecessary work and improve performance.
  // If balances and prices are small or the computation is cheap, useMemo adds unnecessary complexity.
  const sortedBalances: FormattedWalletBalance[] = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
      // [ERROR]: The `lhsPriority` is used in the filter condition, but not defined => it should be `balancePriority`
      const balancePriority = getPriority(balance.blockchain);

      // [IMPROVEMENT]: Update condition to make it more readable
      // if (lhsPriority > -99) {
      //    if (balance.amount <= 0) {
      //      return true;
      //    }
      // }
      // return false

      return balancePriority > -99 && balance.amount <= 0;
    }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      // [IMPROVEMENT]: Make condition more concisely
      // if (leftPriority > rightPriority) {
      //   return -1;
      // } else if (rightPriority > leftPriority) {
      //   return 1;
      // }
      return rightPriority - leftPriority;
    }).map((balance: WalletBalance) => { // [IMPROVEMENT]: Map the sortedBalances to the FormattedWalletBalance type
      return {
        ...balance,
        formatted: balance.amount.toFixed()
      }
    });
  }, [balances, prices]);

  // [IMPROVEMENT]: Redundant mapping, we can directly use the sortedBalances in the rows
  // const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
  //   return {
  //     ...balance,
  //     formatted: balance.amount.toFixed()
  //   }
  // })

  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    // [IMPROVEMENT]: No need to create a new variable for usdValue here to save memory
    // const usdValue = prices[balance.currency] * balance.amount;

    // [IMPROVEMENT]: key={index} - Uses index as a key in .map(), which is not ideal if the list can change order or have duplicates => use unique identifier like balance.currency
    // [IMPROVEMENT]: usdValue -  by checking if the price is a number, we can avoid the [ERROR] and by returning null, we can handle inside WalletRow component by showing N/A or invalid price instead of 0 => better UX
    return (
      <WalletRow 
        key={`${index}-${balance.currency}`}
        className={classes.row}
        amount={balance.amount}
        usdValue={
          typeof prices[balance.currency] === 'number'
          ? prices[balance.currency] * balance.amount
          : null // or undefined 
        }
        formattedAmount={balance.formatted}
      />
    )
  })

  return (
    <div { ...rest } >
      { rows }
    </div>
  )
}