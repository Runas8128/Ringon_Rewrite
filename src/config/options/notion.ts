import { isTesting } from './client_options';

export const deck = {
  "list": isTesting ? "e03e004d47df40fe8377bfda713c5707" : "8ef3fed5a101492882ba96dab96c096b",
  "contrib": isTesting ? "89c22f42529a4401bff30369544e8e51" : "7a5aec5497b64aa5a9e0942fbeb81c97",
  "pack": isTesting ? "3c6ad8b7d3ca4aa9b30a277ab44cdc86" : "f0d5786e2cbc49fea095f6525ef02267",
};

export const detect = {
  "full": isTesting ? "10457888488b4c25901bd7568230d8dd" : "481b6de47c6a41debf83fe1b93700622",
  "prob": isTesting ? "1f0ba8521472436390ce713b78eae2c0" : "5e22777f724b4f27a336cdce350bc1a2",
};
