import { SensorDetailsPage } from "@/components/sensor/rendering-sensor"

const Page = async ({ params }: { params: { paramsId: string } }) => {
    const { paramsId } = await params

    return (
        <div>
            {/* <h1>{paramsId}</h1> */}
            <SensorDetailsPage id={paramsId} />
        </div>
    )
}

export default Page
