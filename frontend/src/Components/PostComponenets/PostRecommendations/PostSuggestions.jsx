import React, { useEffect, useState } from 'react'
import { getSuggestedPosts } from '../../../DataFetching/DataFetching';
import { useParams } from 'react-router-dom';
import PostSuggestionItem from './PostSuggestionItem';
import { ArrowBackIos } from '@mui/icons-material';

const PostSuggestions = () => {

    const {id} = useParams()
    
    const [PostRecommendations, setPostRecommendations] = useState([])

    useEffect(() => {
      getSuggestedPosts(id)
        .then((data) => {
          setPostRecommendations(data);
          console.log('posts recommendations', data);
        })
        .catch((err) => {
          console.error('Error fetching post recommendations:', err);
        });
    }, [id]); // Remove PostRecommendations from the dependency array

    if (PostRecommendations.length === 0) {
      return (
        <div className="text-white p-2 flex flex-col justify-center items-center text-xs ">
          No posts found
        </div>
      );
    }


  return (
    <div className="max-w-sm mx-auto bg-white p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Suggestions :</h2>
        <ArrowBackIos className="text-gray-500" />
      </div>
      <p className="text-gray-500 mb-4">Daily usage</p>

<PostSuggestionItem />

      </div>
  )
}

export default PostSuggestions