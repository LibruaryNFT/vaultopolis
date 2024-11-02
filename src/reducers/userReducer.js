// Initial state of UserContext
export const initialState = {
  user: { loggedIn: null },
  nftDetails: [],
  hasCollection: null,
  hasVault: null,
  tshotBalance: null,
  selectedNFTs: [],
  transactionInfo: "",
  showModal: false,
  network: "",
  tierCounts: {
    common: 0,
    rare: 0,
    fandom: 0,
    legendary: 0,
    ultimate: 0,
  },
};

// Reducer function to handle actions
export const userReducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };

    case "SET_NFT_DETAILS":
      return { ...state, nftDetails: action.payload };

    case "SET_COLLECTION_STATUS":
      return { ...state, hasCollection: action.payload };

    case "SET_VAULT_STATUS":
      return { ...state, hasVault: action.payload };

    case "SET_TSHOT_BALANCE":
      return { ...state, tshotBalance: action.payload };

    case "SELECT_NFT":
      return {
        ...state,
        selectedNFTs: state.selectedNFTs.includes(action.payload)
          ? state.selectedNFTs.filter((id) => id !== action.payload)
          : [...state.selectedNFTs, action.payload],
      };

    case "SET_SELECTED_NFTS": // Added this case
      return { ...state, selectedNFTs: action.payload };

    case "RESET_SELECTED_NFTS":
      return { ...state, selectedNFTs: [] };

    case "SET_TIER_COUNTS":
      return { ...state, tierCounts: action.payload };

    case "SET_TRANSACTION_INFO":
      return { ...state, transactionInfo: action.payload };

    case "TOGGLE_MODAL":
      return { ...state, showModal: action.payload };

    case "SET_NETWORK":
      return { ...state, network: action.payload };

    case "RESET_STATE":
      return initialState;

    default:
      return state;
  }
};
