import  api , {baseAPI} from '../apiProvider'
interface Credentials {
  username: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
  };
}

interface UserData {
  isLoggedIn: boolean;
  loginTime: string;
  username: string;
  userId: string;
}

interface SignUpCredentials {
  username: string;
  password: string;
}

interface SignUpResponse {
  message: string;
}

export const UserLogin = async (credentials: Credentials): Promise<UserData> => {
  try {
    const response = await baseAPI.post<LoginResponse>('/users/login', credentials);

    // Validate response data
    if (!response?.data?.token) {
      throw new Error('No token received from server');
    }

    // Store token in sessionStorage
    sessionStorage.setItem('accessToken', response.data.token);
    localStorage.setItem('accessToken', response.data.token);

    // Prepare and store user data
    const userData: UserData = {
      isLoggedIn: true,
      loginTime: new Date().toISOString(),
      username: response.data.user.username,
      userId: response.data.user.id,
    };
    localStorage.setItem('userData', JSON.stringify(userData));

    return userData;
  } catch (error: any) {
    // Handle error responses
    let errorMessage = 'Failed to login';

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message; // Use backend-provided message
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

export const isAuthenticated = () => {
  // Check both localStorage and Redux store
  const localStorageAuth = !!sessionStorage.getItem('accessToken')

  return localStorageAuth
}


export const UserSignUp = async (credentials: SignUpCredentials): Promise<SignUpResponse> => {
  try {
    console.log("Hello new user")
    const response = await baseAPI.post<SignUpResponse>('/users/register', credentials);

    // Validate response data
    if (!response?.data?.message) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error: any) {
    let errorMessage = 'Failed to signup';

    // Handle backend error responses
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message; // e.g., "Username already exists"
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error; // e.g., "Internal server error"
    } else if (error.message) {
      errorMessage = error.message; // Network or other errors
    }

    throw new Error(errorMessage);
  }
};