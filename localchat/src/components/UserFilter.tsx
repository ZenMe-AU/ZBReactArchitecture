
// import { useState } from 'react';

interface UserFilterProps {
    onClick: () => void;
    onChange: () => void;
    params: {distance:number, limited:number, datetime:string, interval:string};
}


const UserFilter = ({onClick, params, onChange}: UserFilterProps) => {
    return (
        <>
            <div className="card" style={{width:"30rem"}}>
                <div className="card-body">
                    <div className="form-group">
                        <label>datetime</label>
                        <input type="datetime-local" name="datetime" className="form-control" value={params.datetime} onChange={onChange} />
                    </div>
                    <div className="form-group">
                        <label>interval</label>
                        <input type="number" name="interval" className="form-control" value={params.interval} min="10" step="10" onChange={onChange} />
                    </div>
                    <div className="form-group">
                        <label>distance(meter)</label>
                        <input type="number" id="distance" name="distance" className="form-control" min="1" max="200" value={params.distance} onChange={onChange}/>
                    </div>
                    {/* <div className="form-group">
                        <label>limited</label>
                        <input type="number" id="limited" name="limited" className="form-control" min="1" max="100" value={params.limited} onChange={onChange}/>
                    </div> */}
                    <button className="btn btn-primary" onClick={onClick}>Search</button>
                </div>
            </div>
        </>
    )
}

export default UserFilter