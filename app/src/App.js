import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import axios from "axios";
import Escrow from './artifacts/contracts/Escrow.sol/Escrow';
import Table from 'react-bootstrap/Table';


const provider = new ethers.providers.Web3Provider(window.ethereum);
const serverUrl = process.env.REACT_APP_SERVER_URL;


export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();
  const [signerAddress, setSignerAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [approveMessage, setApproveMessage] = useState('')

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);
      console.log(serverUrl)
      setAccount(accounts[0]);
      const signerProvider = provider.getSigner();
      setSignerAddress(await signerProvider.getAddress());
      setSigner(signerProvider);
      const url = `${serverUrl}/api/contract`;
      const contracts = await axios.get(url);
      console.log("signer", await signerProvider.getAddress());
      setEscrows(contracts.data.contracts);
    }


    getAccounts();
  }, []);

  const handleApprove = async (contractAddress) =>{
    try{
    const escrowContract = await new ethers.Contract(contractAddress, Escrow.abi, signer);
    escrowContract.on('Approved', () => {
      document.getElementById(escrowContract.address).className =
        'complete';
      document.getElementById(escrowContract.address).innerText =
        "✓ It's been approved!";
    });
    await approve(escrowContract, signer);
    await axios.post(`${serverUrl}/api/approve`, {contractAddress});
    const contracts = await axios.get(`${serverUrl}/api/approve`);
    setEscrows(contracts.data.contracts);
    
  } catch(err){
    console.log(err.error)
    if (err.error.code && err.error.code === -32000){
      setApproveMessage("You are not authorized to approve this transaction")
      setTimeout(()=>{
        setApproveMessage("")
      }, 1500)
    }
    else {
      setApproveMessage("There has been an error with the execution of the transaction, please try again in a while")
      setTimeout(()=>{
        setApproveMessage("")
      }, 200)
    }
  }
  }

  async function newContract() {
    if (amount <= 0.01){
      setErrorMessage("Value must be above 0.01 ETH")
      setTimeout(()=>{
        setErrorMessage("")
      },1500)
    }
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const value = ethers.utils.parseEther(amount).toString();
    console.log("signer address:", signer)
    const escrowContract = await deploy(signer, arbiter, beneficiary, value);
    console.log("full contract item:", escrowContract)
    const newContract = await axios.post(`${serverUrl}/api/contract`, {sender:await signer.getAddress(), contractAddress: escrowContract.address, arbiter, beneficiary, amount:value});
    console.log("newContract created:", newContract);
      const url = `${serverUrl}/api/contract`;
      const contracts = await axios.get(url);
      console.log("fetch contracts DB after creating new Contract:", contracts);
      setEscrows(contracts.data.contracts);
  }

  return (
    <div>
    <div className='flex-box'>
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input type="text" id="arbiter" />
        </label>

        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" />
        </label>

        <label>
          Deposit Amount (in ETH)
          <input onChange={(e)=>setAmount(e.target.value)} type="text" id="wei" />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
        >
          Deploy
        </div>
        <div style={{textAlign:'center'}} id='error-msg'>{errorMessage}</div>
      </div>

      <div  className="existing-contracts">
        <h1> Existing Contracts </h1>

        <div id="container">
        <Table striped bordered hover>
        <thead>
          <tr>
            <th>Contract Address</th>
            <th>Beneficiary</th>
            <th>Arbiter</th>
            <th>Amount (ETH)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          
          {escrows && escrows.map((escrow) => {
            return ( <tr key={escrow.contractAddress}>
              <td>{escrow.contractAddress && <a rel="noreferrer" target='_blank' href={`https://codex-dao-blockexplorer.vercel.app/address/${escrow.contractAddress}`}>{escrow.contractAddress.slice(0,5)+".."+escrow.contractAddress.slice(38)}</a>}</td>
              <td><a rel="noreferrer" target='_blank' href={`https://codex-dao-blockexplorer.vercel.app/address/${escrow.beneficiary}`}>{escrow.beneficiary.slice(0,5)+"..."+ escrow.beneficiary.slice(38)}</a></td>
              <td><a rel="noreferrer" target='_blank' href={`https://codex-dao-blockexplorer.vercel.app/address/${escrow.arbiter}`}>{escrow.arbiter.slice(0,5)+"..."+ escrow.arbiter.slice(38)}</a></td>
              <td>{ethers.utils.formatEther(escrow.amount)}</td>
              <td>{(escrow.status !== "Approved" && signerAddress === escrow.arbiter) && 
                    <div className="button" id={escrow.contractAddress}
                onClick={(e) => {
                  e.preventDefault();
                  handleApprove(escrow.contractAddress);
                }}
                >
                Approve
                </div>
              }
              {(escrow.status !== "Approved" && signerAddress !== escrow.arbiter ) && 
                    <div className="pending" id={escrow.contractAddress}>
                Pending Approval
                </div>
              }
              {escrow.status === "Approved" && <i class="bi bi-check-square-fill"></i>}
              </td>
              </tr>
            );
          })}
          
        </tbody>
      </Table>
          
        </div>
      </div>
      
    </div>
    <div style={{textAlign:"center", color:"red"}}>
        <p>{approveMessage}</p>
      </div>
    </div>
  );
}

export default App;
