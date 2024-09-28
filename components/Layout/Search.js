import React, { useState } from 'react';
import cookies from 'js-cookie';
import { List, Image, Search } from 'semantic-ui-react';
import baseUrl from '../../utils/baseUrl';
import axios from 'axios';
import Router from 'next/router';

let cancel;

function SearchComponent() {
	const [text, setText] = useState('');
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState([]);

	const handleChange = async (e) => {
		e.preventDefault();

		const { value } = e.target;

		if (value.length === 0) {
			setResults([]);
			setText('');
			return;
		}

		setText(value);
		setLoading(true);

		try {
			cancel = cancel && cancel();

			const CancelToken = axios.CancelToken;
			const token = cookies.get('token');

			const res = await axios.get(`${baseUrl}/api/search/${value}`, {
				headers: { Authorization: token },
				cancelToken: new CancelToken((canceler) => {
					cancel = canceler;
				}),
			});
			if (res.data.length == 0) return setLoading(false);
			setResults(res.data);
		} catch (error) {
			console.log('Error Searching');
		}
		setLoading(false);
	};

	return (
		<Search
			value={text}
			loading={loading}
			results={results}
			minCharacters={1}
			resultRenderer={ResultRenderer}
			onBlur={() => {
				results.length > 0 && setResults([]);
				loading && setLoading(false);
				setText('');
			}}
			onSearchChange={handleChange}
			onResultSelect={(e, data) => Router.push(`/${data.result.username}`)}
		/>
	);
}

const ResultRenderer = ({ _id, name, profilePicUrl }) => {
	return (
		<List key={_id}>
			<List.Item>
				<Image
					src={profilePicUrl}
					avatar
					alt='Profile Pic'
				/>
				<List.Content
					header={name}
					as='a'
				/>
			</List.Item>
		</List>
	);
};

export default SearchComponent;
