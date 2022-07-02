import axios from "axios";

import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const baseUrl = `http://${publicRuntimeConfig.HOST}\
:${publicRuntimeConfig.BACKEND_PORT}\
/match`;

axios.defaults.withCredentials = true;

const getForOneUser = (userLogin42: string) => {
  return axios
    .get(`${baseUrl}/${userLogin42}`)
    .then((response) => response.data);
};

// dev
const createMatch = (
  opponentLogin42: string,
  selfScore: number,
  opponentScore: number
) => {
  return axios
    .post(baseUrl, { opponentLogin42, selfScore, opponentScore })
    .then((response) => response.data);
};

export default {
  getForOneUser,
  createMatch,
};
