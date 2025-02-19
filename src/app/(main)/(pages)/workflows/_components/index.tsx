import React from 'react'
import Workflow from './workflow'
import { onGetWorkflows } from '../_actions/workflow-connections'
import MoreCredits from './more-credits'

type Props = {}

const Workflows = async (props: Props) => {
  const workflows = await onGetWorkflows()
  console.log(workflows)
  return (
    <div className='relative flex flex-col gap-4'>
        <section className='flex flex-col m-2 gap-4'>
          <MoreCredits />
            {workflows?.length
              ? workflows.sort((a, b) => a.name.localeCompare(b.name)).map((flow) => (
                <Workflow
                  key={flow.id}
                  {...flow}
                />
              ))
            : (
              <div className='mt-20 text-muted-foreground flex items-center justify-center'>No Workflows</div>
            )}
        </section>
    </div>
  )
}

export default Workflows