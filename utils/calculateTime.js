import moment from 'moment';
import Moment from 'react-moment';

export default function calculateTime(createdAt) {
	const today = moment(Date.now());
	const postDate = moment(createdAt);

	const diffInHours = today.diff(postDate, 'hours');

	if (diffInHours < 24) {
		return (
			<>
				Today <Moment format='hh:mm A'>{createdAt}</Moment>
			</>
		);
	} else if (diffInHours >= 24 && diffInHours < 36) {
		return (
			<>
				Yesterday <Moment format='hh:mm A'>{createdAt}</Moment>
			</>
		);
	} else {
		return (
			<>
				<Moment format='DD/MM/YYYY hh:mm A'>{createdAt}</Moment>
			</>
		);
	}
}
