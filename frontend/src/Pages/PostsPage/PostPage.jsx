import React from 'react'
import { Post, ADS } from '../../Components'

const PostPage = () => {


  return (
    <>
      <div className='flex justidy-center items-start w-full  px-4 py-2'>
        {/* posts section */}
        <div className='grid border items-center w-full px-4 py-4'>
          {/* header of the category */}
          <div className='flex justify-center items-center '>
            <strong className='font-bold text-2xl '>ANIME SECTION EXEMPLE</strong>
          </div>
          {/* posts */}
          <div className=' mt-4'>
            <Post />
            <Post />
          </div>
        </div>
        {/* ads section */}
        <div className=' grid justify-center items-center border w-[25rem] py-2 px-4 '>
          <ADS />
        </div>

      </div>
    </>
  )
}

export default PostPage