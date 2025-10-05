const Table = ({ columns, data }) => {
    return (
        <table>
            <thead>
                <tr>
                    {columns.map((column) => (
                        <th key={column.accessor}>{column.header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row) => (
                    <tr key={row.id}>
                        {columns.map((column) => (
                            <td key={column.accessor}>{row[column.accessor]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Table;