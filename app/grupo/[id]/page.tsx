import GroupDetailsPage from "@/components/grupoId/Groupt"

const Page = async ({ params }: { params: { id: string } }) => {
    const { id } = await params
    return (
        <div className=''>
            <GroupDetailsPage id={id} />
        </div>
    )
}

export default Page