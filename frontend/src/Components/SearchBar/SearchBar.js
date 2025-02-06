
import { Link } from 'react-router-dom'
import { Search } from '@mui/icons-material'
import { Button } from '@material-tailwind/react'

const SearchBar = () => {


    return (
        <>
            <div className='w-full'>
                <Link to={'/Search'}>
                    <Button className='w-[10rem] px-2 py-2 border bg-surface hover:bg-surface-light border-slate-700 flex justify-end items-center'>

                        <Search />

                    </Button>
                </Link>
            </div>
        </>
    )
}

export default SearchBar