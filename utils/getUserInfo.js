import axios from 'axios';
import baseUrl from './baseUrl';
import cookies from 'js-cookie';

const getUserInfo = async (userToFindId) => {
	try {
		const res = await axios.get(`${baseUrl}/api/chats/user/${userToFindId}`, {
			headers: {
				Authorization: cookies.get('token'),
			},
		});

		return { name: res.data.name, profilePicUrl: res.data.profilePicUrl };
	} catch (error) {
		console.log('error looking for user');
	}
};
export default getUserInfo;
