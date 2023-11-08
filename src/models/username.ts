
let username: string | null = null;

const getUsername = (): string => {
  return username ?? 'Anonymous';
}

const setUsername = (newUsername: string) => {
  username = newUsername;
}

export {getUsername, setUsername};
