import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import Pagination from '../Pagination'

const meta: Meta<typeof Pagination> = {
  title: 'OOH Kit/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof Pagination>

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    return (
      <Pagination
        currentPage={page}
        totalPages={35}
        totalItems={350}
        itemsPerPage={10}
        onPageChange={setPage}
      />
    )
  },
}

export const LastPage: Story = {
  render: () => {
    const [page, setPage] = useState(35)
    return (
      <Pagination
        currentPage={page}
        totalPages={35}
        totalItems={350}
        itemsPerPage={10}
        onPageChange={setPage}
      />
    )
  },
}

export const SmallDataset: Story = {
  render: () => {
    const [page, setPage] = useState(1)
    return (
      <Pagination
        currentPage={page}
        totalPages={3}
        totalItems={25}
        itemsPerPage={10}
        onPageChange={setPage}
      />
    )
  },
}
